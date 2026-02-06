# MORODAS OS

> **AIエージェント × N8Nワークフローで「魔法を編み出す側」へ**

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)
![N8N](https://img.shields.io/badge/N8N-Ready-orange)

## ビジョン

MORODAS OSは、MANUSやGensparkのような「ワークフローの究極形」を自分で構築できるプラットフォームです。

| AIエージェントの構成要素 | MORODAS OSでの実装 |
|-------------------------|-------------------|
| タスク分解 (Planning) | エージェントテンプレート |
| 道具の使い分け (Tool Use) | N8N連携・ツール統合 |
| やり直しの反復 (Loop) | 実行履歴・再実行機能 |

```
MORODAS OS (GUI) ←→ N8N (ワークフローエンジン) ←→ 外部ツール (X/Google/Slack)
```

## 機能一覧

### ✅ 実装済み
- 📊 **ダッシュボード** - KPI・エンゲージメントチャート
- 📰 **フィード** - AIレポート一覧・ステータス管理
- 🤖 **エージェント管理** - テンプレート・4タブ詳細パネル
- 🔧 **ツール連携UI** - X/Google/Slack連携管理
- ⏰ **トリガー設定** - スケジュール自動実行
- 📈 **CRM** - カンバンボード・案件管理
- 💬 **チャット** - セッション管理

### 🔜 開発中
- OAuth実際の認証
- N8N Cronジョブ連携
- グローバルAIアシスタント

## セットアップ

```bash
# 依存関係インストール
npm install

# Prisma セットアップ
npx prisma generate
npx prisma db push

# 開発サーバー起動
npm run dev
```

http://localhost:3000 で起動します。

## 技術スタック

- **Frontend**: Next.js 16、React、TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite（開発）/ PostgreSQL（本番）
- **ORM**: Prisma
- **Workflow**: N8N（外部連携）

## リポジトリ

https://github.com/morodas-ai/morodas-os

---

**魔法に驚く側ではなく、魔法を編み出す側へ。**
