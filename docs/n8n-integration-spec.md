# MORODAS OS × n8n 連携 完全仕様書

**バージョン**: 2.0 (Complete Edition)
**作成日**: 2026-02-05
**作成者**: Antigravity COO
**対象**: OPEN CLAW

---

## 📋 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [環境情報](#3-環境情報)
4. [データベース仕様](#4-データベース仕様)
5. [API仕様](#5-api仕様)
6. [n8nワークフロー設計](#6-n8nワークフロー設計)
7. [実装手順](#7-実装手順)
8. [テスト方法](#8-テスト方法)
9. [トラブルシューティング](#9-トラブルシューティング)
10. [FAQ](#10-faq)

---

## 1. プロジェクト概要

### 1.1 MORODAS OSとは

MORODAS OSは、オジキ（諸田）のための自律型マルチエージェント・マーケティングシステムです。
AIエージェントが自動で情報収集・分析を行い、その結果をダッシュボードに表示します。

### 1.2 n8nの役割

n8nは「頭脳」として、以下を担当:
- 外部API（X、Note、TechCrunch等）からのデータ取得
- AIによる分析・要約
- MORODAS OS APIへのデータ送信
- 定期実行（スケジューラー）

### 1.3 全体フロー

```
[外部API/Web]
     │
     ▼
┌─────────────┐
│    n8n      │  ← VPS (Kagoya) で稼働
│  ワークフロー │
└─────────────┘
     │ HTTP POST
     ▼
┌─────────────┐
│ MORODAS OS  │  ← VPS (Kagoya) で稼働
│  Next.js    │
│    API      │
└─────────────┘
     │
     ▼
┌─────────────┐
│ PostgreSQL  │  ← VPS (Kagoya) で稼働
│    DB       │
└─────────────┘
     │
     ▼
[フロントエンド表示]
```

---

## 2. システムアーキテクチャ

### 2.1 技術スタック

| 層 | 技術 | バージョン |
|----|------|-----------|
| フロントエンド | Next.js | 16.1.6 |
| バックエンド | Next.js API Routes | - |
| ORM | Prisma | 6.19.2 |
| データベース | PostgreSQL（本番）/ SQLite（開発） | 15+ / - |
| ワークフロー | n8n | 1.x |
| ホスティング | Kagoya VPS | Ubuntu 22.04 |

### 2.2 ディレクトリ構造

```
morodas-os-init/
├── app/
│   ├── api/                    # APIエンドポイント
│   │   ├── reports/
│   │   │   ├── route.ts        # GET/POST /api/reports
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET/PATCH /api/reports/:id
│   │   ├── tasks/
│   │   │   └── route.ts        # GET/POST /api/tasks
│   │   ├── alerts/
│   │   │   └── route.ts        # GET/POST/PATCH /api/alerts
│   │   ├── metrics/
│   │   │   └── route.ts        # GET/POST /api/metrics
│   │   ├── revenue/
│   │   │   └── route.ts        # GET/POST /api/revenue
│   │   ├── agents/
│   │   │   ├── route.ts        # GET/PATCH /api/agents
│   │   │   └── runs/
│   │   │       └── route.ts    # GET/POST /api/agents/runs
│   │   └── dashboard/
│   │       └── route.ts        # GET /api/dashboard
│   ├── feed/
│   │   ├── page.tsx            # フィード画面
│   │   └── [id]/
│   │       └── page.tsx        # レポート詳細画面
│   ├── dashboard/
│   │   └── page.tsx            # ダッシュボード画面
│   └── ...
├── lib/
│   └── prisma.ts               # Prismaクライアント
├── prisma/
│   ├── schema.prisma           # DBスキーマ定義
│   ├── seed.ts                 # シードデータ
│   └── dev.db                  # 開発用SQLite（本番では使わない）
├── docs/
│   └── n8n-integration-spec.md # この仕様書
├── .env                        # 環境変数（gitignore対象）
└── package.json
```

---

## 3. 環境情報

### 3.1 サーバー情報

| 項目 | 値 |
|------|-----|
| VPS | Kagoya Cloud VPS |
| IP | `133.18.xxx.xxx` （実際のIPはオジキに確認） |
| OS | Ubuntu 22.04 LTS |
| SSH | `ssh kazuaki@133.18.xxx.xxx` |

### 3.2 サービス構成

| サービス | ポート | URL |
|----------|--------|-----|
| MORODAS OS (Next.js) | 3000 | `http://133.18.xxx.xxx:3000` |
| n8n | 5678 | `http://133.18.xxx.xxx:5678` |
| PostgreSQL | 5432 | localhost:5432 |

### 3.3 環境変数

**MORODAS OS側 (`.env`):**

```bash
# データベース接続
# 開発環境（SQLite）
DATABASE_URL="file:./dev.db"

# 本番環境（PostgreSQL）
# DATABASE_URL="postgresql://morodas:password@localhost:5432/morodas_os?schema=public"

# API認証キー（n8nからのリクエスト認証用）
MORODAS_API_KEY="your-secure-api-key-here"

# 環境
NODE_ENV="production"
```

**n8n側の環境変数（Credentials）:**

```bash
MORODAS_API_URL=http://localhost:3000   # 同一VPS内ならlocalhost
MORODAS_API_KEY=your-secure-api-key-here
```

---

## 4. データベース仕様

### 4.1 データベースの場所

| 環境 | 種類 | 場所 |
|------|------|------|
| 開発 | SQLite | `prisma/dev.db` |
| 本番 | PostgreSQL | VPS上の `localhost:5432` |

### 4.2 PostgreSQL接続情報（本番）

```
Host: localhost (VPS内部)
Port: 5432
Database: morodas_os
User: morodas
Password: （オジキに確認）
```

### 4.3 テーブル一覧

```sql
-- エージェント
Agent {
  id          String   @id
  name        String   -- "News Agent" など
  type        String   -- "news", "social", "competitor" など
  description String?
  enabled     Boolean
  config      String   -- JSON設定
  lastRunAt   DateTime?
}

-- レポート（フィードに表示）
Report {
  id          String   @id
  agentId     String   -- FK → Agent
  title       String
  description String
  status      String   -- "review", "processing", "done", "archived"
  content     String   -- JSON本文
  workspace   String
}

-- タスク（優先タスクリスト）
Task {
  id               String   @id
  title            String
  description      String?
  priority         String   -- "high", "medium", "low"
  status           String   -- "pending", "in_progress", "done", "stagnant"
  estimatedMinutes Int?
  lastActivityAt   DateTime
  stagnantDays     Int
}

-- アラート（停滞検知等）
Alert {
  id          String   @id
  type        String   -- "stagnation", "deadline", "revenue", "system"
  severity    String   -- "info", "warning", "critical"
  title       String
  message     String
  isRead      Boolean
  isDismissed Boolean
}

-- メトリクス（KPI）
Metric {
  id            String   @id
  name          String   -- "x_followers", "note_weekly_pv" など
  value         Int
  change        Int?
  changePercent Float?
  target        Int?
  date          DateTime
}

-- 月次収益
MonthlyRevenue {
  id                  String @id
  year                Int
  month               Int
  noteRevenue         Int
  consultingRevenue   Int
  developmentRevenue  Int
  otherRevenue        Int
  totalRevenue        Int
  targetRevenue       Int
}

-- 収益トランザクション
Revenue {
  id          String   @id
  amount      Int      -- 金額（円）
  source      String   -- "note", "consulting", "development", "other"
  description String?
  date        DateTime
}

-- エージェント実行履歴
AgentRun {
  id        String   @id
  agentId   String   -- FK → Agent
  status    String   -- "pending", "running", "completed", "failed"
  output    String   -- JSON出力
  error     String?
  duration  Int?     -- 秒
}

-- システム設定
Setting {
  key         String @unique
  value       String
  description String?
}
```

### 4.4 DBマイグレーション方法

```bash
# スキーマをDBに反映（開発）
npx prisma db push

# 本番環境でのマイグレーション
npx prisma migrate deploy

# Prisma Clientを再生成
npx prisma generate

# シードデータ投入
npm run db:seed

# DB確認（GUI）
npx prisma studio
```

---

## 5. API仕様

### 5.1 共通仕様

**ベースURL:**
- 開発: `http://localhost:3000/api`
- 本番: `http://133.18.xxx.xxx:3000/api` または `https://morodas.example.com/api`

**認証:**
```http
X-API-Key: {MORODAS_API_KEY}
```

**レスポンス形式:**
```json
// 成功
{ "success": true, "data": { ... } }

// エラー
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

### 5.2 POST /api/reports

**目的:** エージェントの実行結果をレポートとして保存

**リクエスト:**
```json
{
  "agentType": "news",           // 必須: news, social, competitor, growth, geo, seo, socialmedia
  "title": "日次ニュースサマリー",  // 必須: レポートタイトル
  "description": "2026年2月5日...", // 必須: 概要（カード表示用）
  "status": "review",            // 任意: review(デフォルト), processing, done, archived
  "workspace": "Default Workspace", // 任意
  "content": {                   // 必須: レポート本文（JSON）
    "summary": "本日の主要トピック...",
    "topics": [
      { "title": "トピック1", "content": "詳細..." }
    ],
    "insights": [
      { "area": "業務効率", "strategy": "戦略", "expected": "期待効果" }
    ],
    "recommendedActions": ["アクション1", "アクション2"],
    "sns": [
      { "platform": "x", "author": "@user", "content": "...", "likes": 100, "retweets": 20, "replies": 5 }
    ],
    "sources": [
      { "name": "TechCrunch", "url": "https://..." }
    ]
  }
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "clz1abc...",
    "agentId": "agent-news",
    "title": "日次ニュースサマリー",
    "status": "review",
    "createdAt": "2026-02-05T10:00:00.000Z"
  }
}
```

---

### 5.3 POST /api/tasks

**目的:** 推奨アクションをタスクとして登録

**リクエスト:**
```json
{
  "title": "note記事の投稿",        // 必須
  "description": "詳細説明",        // 任意
  "priority": "high",              // 任意: high, medium(デフォルト), low
  "estimatedMinutes": 45,          // 任意: 推定所要時間（分）
  "agentType": "seo",              // 任意: 生成元エージェント
  "reportId": "clz1abc...",        // 任意: 関連レポートID
  "dueDate": "2026-02-06T18:00:00Z" // 任意: 期限
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "task-xyz...",
    "title": "note記事の投稿",
    "priority": "high",
    "status": "pending",
    "createdAt": "2026-02-05T10:00:00.000Z"
  }
}
```

---

### 5.4 POST /api/alerts

**目的:** 停滞検知などのアラートを作成

**リクエスト:**
```json
{
  "type": "stagnation",            // 必須: stagnation, deadline, revenue, system
  "severity": "critical",          // 任意: info, warning(デフォルト), critical
  "title": "タスクが2日間停止中",    // 必須
  "message": "最終更新: 2026/02/03", // 必須
  "relatedType": "task",           // 任意: task, report, agent
  "relatedId": "task-4"            // 任意: 関連エンティティID
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "alert-abc...",
    "type": "stagnation",
    "severity": "critical",
    "createdAt": "2026-02-05T10:00:00.000Z"
  }
}
```

---

### 5.5 POST /api/metrics

**目的:** 成長指標（フォロワー数、PV等）を更新

**リクエスト:**
```json
{
  "metrics": [
    {
      "name": "x_followers",      // 必須: メトリクス名
      "value": 50,                // 必須: 現在値
      "change": 5,                // 任意: 前回からの変化
      "changePercent": 11.1,      // 任意: 変化率（%）
      "target": 10000             // 任意: 目標値
    },
    {
      "name": "note_weekly_pv",
      "value": 200,
      "change": 50,
      "changePercent": 33.3,
      "target": 1000
    }
  ]
}
```

**メトリクス名一覧:**
| name | 説明 |
|------|------|
| `x_followers` | Xフォロワー数 |
| `note_weekly_pv` | Note週間PV |
| `note_monthly_pv` | Note月間PV |
| `note_likes` | Noteスキ数（累計） |
| `youtube_subscribers` | YouTubeチャンネル登録者 |
| `youtube_views` | YouTube総再生回数 |

**レスポンス (200):**
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "metrics": [
      { "name": "x_followers", "value": 50 },
      { "name": "note_weekly_pv", "value": 200 }
    ]
  }
}
```

---

### 5.6 POST /api/revenue

**目的:** 収益を登録

**リクエスト:**
```json
{
  "amount": 50000,                // 必須: 金額（円）
  "source": "consulting",         // 必須: note, consulting, development, other
  "description": "A社コンサル",    // 任意
  "date": "2026-02-05",           // 任意: 発生日（デフォルト: 今日）
  "clientId": "client-123"        // 任意: クライアントID
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "rev-abc...",
    "amount": 50000,
    "source": "consulting",
    "monthlyTotal": 150000
  }
}
```

---

### 5.7 POST /api/agents/runs

**目的:** エージェントの実行履歴を記録

**リクエスト:**
```json
{
  "agentType": "news",            // 必須
  "status": "completed",          // 必須: pending, running, completed, failed
  "duration": 45,                 // 任意: 実行時間（秒）
  "output": {                     // 任意: 出力データ
    "processedItems": 15,
    "generatedReports": 1
  },
  "error": null                   // 任意: エラーメッセージ
}
```

**レスポンス (201):**
```json
{
  "success": true,
  "data": {
    "id": "run-abc...",
    "agentId": "agent-news",
    "status": "completed",
    "duration": 45
  }
}
```

---

## 6. n8nワークフロー設計

### 6.1 News Agent

**スケジュール:** 毎日 9:00 JST

**フロー:**
```
[Schedule Trigger]
  │ Cron: 0 9 * * *
  ▼
[HTTP Request: RSS取得]
  │ URL: TechCrunch, 日経, ITmedia等
  ▼
[Code: データ整形]
  │ 記事タイトル・本文を抽出
  ▼
[AI Agent: 分析]
  │ Gemini/GPTで要約・インサイト抽出
  ▼
[HTTP Request: レポート作成]
  │ POST /api/reports
  │ agentType: "news"
  ▼
[HTTP Request: タスク作成]
  │ POST /api/tasks
  │ 推奨アクションをタスク化
  ▼
[HTTP Request: 実行記録]
  │ POST /api/agents/runs
  ▼
[END]
```

### 6.2 Growth Metrics Agent

**スケジュール:** 毎日 8:00 JST

**フロー:**
```
[Schedule Trigger]
  │ Cron: 0 8 * * *
  ▼
[HTTP Request: X API]
  │ フォロワー数取得
  ▼
[HTTP Request: Note API]
  │ PV/スキ数取得
  ▼
[Code: 変化量計算]
  │ 前回値との差分を計算
  ▼
[HTTP Request: メトリクス更新]
  │ POST /api/metrics
  ▼
[IF: 目標未達 or 減少]
  │
  ├─[Yes]→ [HTTP Request: アラート作成]
  │         POST /api/alerts
  │         type: "revenue" or "system"
  │
  └─[No]──→ [続行]
  ▼
[HTTP Request: 実行記録]
  │ POST /api/agents/runs
  ▼
[END]
```

### 6.3 Stagnation Detection

**スケジュール:** 毎日 18:00 JST

**フロー:**
```
[Schedule Trigger]
  │ Cron: 0 18 * * *
  ▼
[HTTP Request: タスク取得]
  │ GET /api/tasks?status=pending
  ▼
[Code: 停滞検出]
  │ lastActivityAt が2日以上前のタスクを抽出
  ▼
[IF: 停滞タスクあり]
  │
  ├─[Yes]→ [Loop: 各タスクに対して]
  │         │
  │         ├→ [HTTP Request: アラート作成]
  │         │   POST /api/alerts
  │         │   type: "stagnation"
  │         │   severity: "critical"
  │         │
  │         └→ [Telegram: 通知]
  │             オジキにメッセージ送信
  │
  └─[No]──→ [続行]
  ▼
[HTTP Request: 実行記録]
  │ POST /api/agents/runs
  ▼
[END]
```

### 6.4 Social Listening Agent

**スケジュール:** 毎日 10:00 JST

**フロー:**
```
[Schedule Trigger]
  │ Cron: 0 10 * * *
  ▼
[HTTP Request: X API v2]
  │ キーワード検索: "OpenClaw", "AI業務効率化", "Remotion"等
  ▼
[Code: ツイート整形]
  │ いいね数/RT数でソート
  ▼
[AI Agent: トレンド分析]
  │ センチメント分析、トレンド抽出
  ▼
[HTTP Request: レポート作成]
  │ POST /api/reports
  │ agentType: "social"
  ▼
[HTTP Request: 実行記録]
  │ POST /api/agents/runs
  ▼
[END]
```

---

## 7. 実装手順

### 7.1 OPEN CLAWが実装する順序（推奨）

```
1. Growth Metrics Agent（最もシンプル）
   ↓
2. News Agent（レポート作成の基本パターン）
   ↓
3. Stagnation Detection（アラート機能）
   ↓
4. Social Listening Agent（X API連携）
   ↓
5. Competitor Analysis Agent（複雑な分析）
```

### 7.2 n8n Credentials設定

**HTTP Header Auth:**
```
Name: MORODAS API Key
Header Name: X-API-Key
Header Value: {MORODAS_API_KEY}
```

### 7.3 HTTP Requestノード設定例

```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/reports",
  "authentication": "predefinedCredentialType",
  "nodeCredentialType": "httpHeaderAuth",
  "sendBody": true,
  "bodyParameters": {
    "agentType": "={{ $json.agentType }}",
    "title": "={{ $json.title }}",
    "description": "={{ $json.summary.substring(0, 200) }}",
    "content": "={{ $json }}"
  }
}
```

---

## 8. テスト方法

### 8.1 curlでAPIテスト

```bash
# レポート作成テスト
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{
    "agentType": "news",
    "title": "テストレポート",
    "description": "これはテストです",
    "content": {"summary": "テストサマリー", "topics": []}
  }'

# メトリクス更新テスト
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{
    "metrics": [
      {"name": "x_followers", "value": 100, "target": 10000}
    ]
  }'

# アラート作成テスト
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{
    "type": "stagnation",
    "severity": "warning",
    "title": "テストアラート",
    "message": "これはテストです"
  }'
```

### 8.2 n8nでのテスト

1. ワークフローを作成
2. 「Test workflow」ボタンで実行
3. MORODAS OSのフィード/ダッシュボードで結果確認

### 8.3 DBデータ確認

```bash
# Prisma Studioでブラウザから確認
cd /path/to/morodas-os-init
npx prisma studio
# → http://localhost:5555 で開く
```

---

## 9. トラブルシューティング

### 9.1 よくあるエラー

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `UNAUTHORIZED` | APIキーが間違っている | `.env`のMORODAS_API_KEYを確認 |
| `VALIDATION_ERROR` | 必須パラメータ不足 | リクエストボディを確認 |
| `AGENT_NOT_FOUND` | agentTypeが不正 | 有効な値: news, social, competitor, growth, geo, seo, socialmedia |
| `Connection refused` | MORODAS OSが起動していない | `npm run dev` or `pm2 start` |
| `ECONNRESET` | タイムアウト | n8nのタイムアウト設定を延長 |

### 9.2 ログ確認

```bash
# MORODAS OS (Next.js) のログ
pm2 logs morodas-os

# n8n のログ
pm2 logs n8n

# PostgreSQL のログ
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## 10. FAQ

### Q1: DBはどこにある？

**開発環境:** `prisma/dev.db` (SQLiteファイル)

**本番環境:** VPS上のPostgreSQL
- Host: localhost
- Port: 5432
- Database: morodas_os

### Q2: API URLは？

**開発:** `http://localhost:3000/api`

**本番:** `http://133.18.xxx.xxx:3000/api`
（n8nと同じVPS上なら `http://localhost:3000/api`）

### Q3: 認証はどうする？

`X-API-Key` ヘッダーにAPIキーを設定。
キーの値はオジキに確認するか、`.env`ファイルを参照。

### Q4: content フィールドは文字列？オブジェクト？

**JSONオブジェクトとして送信。** 文字列化（JSON.stringify）不要。
APIが自動的にDB保存時に文字列化します。

### Q5: どのエージェントから作る？

1. **Growth Metrics Agent** - 最もシンプル（API 1つ呼ぶだけ）
2. **News Agent** - レポート作成の基本
3. 以降は上記を参考に拡張

### Q6: Telegram通知はどうする？

n8nの「Telegram」ノードを使用。
Bot Token と Chat ID はオジキに確認。

### Q7: スケジュールはJST？

n8nのタイムゾーン設定次第。
Cron式で指定する場合はUTCかJSTか確認。
（n8n設定 → Timezone → Asia/Tokyo 推奨）

### Q8: エラーが起きたらどうする？

1. n8nの実行ログを確認
2. curlで直接APIを叩いてレスポンス確認
3. `pm2 logs morodas-os` でサーバーログ確認
4. 解決しない場合はオジキに連絡

---

## 付録: エージェントタイプ一覧

| agentType | 日本語名 | 用途 |
|-----------|----------|------|
| `news` | News Agent | ニュース収集・分析 |
| `social` | Social Listening Agent | SNSトレンド監視 |
| `competitor` | Competitor Analysis Agent | 競合分析 |
| `growth` | Growth Metrics Agent | 成長指標追跡 |
| `geo` | GEO Agent | AI検索最適化 |
| `seo` | SEO Agent | SEO分析 |
| `socialmedia` | Social Media Agent | SNS投稿戦略 |

---

## 付録: ステータス値一覧

**Report.status:**
- `review` - レビュー必要
- `processing` - 処理中
- `done` - 完了
- `archived` - アーカイブ済み

**Task.status:**
- `pending` - 未着手
- `in_progress` - 進行中
- `done` - 完了
- `stagnant` - 停滞

**Alert.severity:**
- `info` - 情報
- `warning` - 警告
- `critical` - 重大

**AgentRun.status:**
- `pending` - 待機中
- `running` - 実行中
- `completed` - 完了
- `failed` - 失敗

---

**以上。不明点があればオジキに確認してください。**
