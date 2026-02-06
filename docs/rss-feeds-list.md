# MORODAS OS 推奨RSSフィード一覧

**作成日**: 2026-02-05
**用途**: News Agent / Social Listening Agent

---

## 📋 カテゴリ別RSSフィード

### 1. 🤖 AI・人工知能（最重要）

| メディア | RSS URL | 更新頻度 | 備考 |
|----------|---------|----------|------|
| **ITmedia AI+** | `https://rss.itmedia.co.jp/rss/2.0/ait.xml` | 高 | AI特化。必須 |
| **Ledge.ai** | `https://ledge.ai/feed/` | 高 | 日本最大級AI特化メディア |
| **Google AI Blog** | `https://blog.google/technology/ai/rss/` | 中 | 最新AI技術 |
| **OpenAI Blog** | `https://openai.com/blog/rss.xml` | 低 | GPT関連 |
| **DeepMind Blog** | `https://www.deepmind.com/blog/rss.xml` | 低 | 研究動向 |

---

### 2. 💼 テック・IT総合

| メディア | RSS URL | 更新頻度 | 備考 |
|----------|---------|----------|------|
| **TechCrunch Japan** | `https://jp.techcrunch.com/feed/` | 高 | スタートアップ・テック全般 |
| **ITmedia 総合** | `https://rss.itmedia.co.jp/rss/2.0/top.xml` | 非常に高 | 総合（量が多い） |
| **ITmedia NEWS** | `https://rss.itmedia.co.jp/rss/2.0/news_breaking.xml` | 非常に高 | 速報系 |
| **ITmedia エンタープライズ** | `https://rss.itmedia.co.jp/rss/2.0/enterprise.xml` | 高 | 企業IT向け |
| **@IT（アットマークIT）** | `https://rss.itmedia.co.jp/rss/2.0/atmarkit.xml` | 高 | エンジニア向け |
| **Impress Watch** | `https://watch.impress.co.jp/data/rss/1.0/wim/feed.rss` | 高 | PC・ガジェット |
| **ASCII.jp** | `https://ascii.jp/rss.xml` | 高 | テック全般 |
| **Publickey** | `https://www.publickey1.jp/atom.xml` | 中 | クラウド・開発ツール特化 |
| **ZDNET Japan** | `https://japan.zdnet.com/info/feed/` | 高 | 企業IT・DX |
| **CNET Japan** | `https://japan.cnet.com/rss/index.rdf` | 高 | テック全般 |

---

### 3. 🏢 DX・デジタルトランスフォーメーション

| メディア | RSS URL | 更新頻度 | 備考 |
|----------|---------|----------|------|
| **デジタル庁** | `https://www.digital.go.jp/rss/news.xml` | 中 | 政府のDX動向 |
| **ビジネス+IT** | `https://www.sbbit.jp/rss/HotTopics.rss` | 高 | 企業DX事例 |
| **日経ビジネス電子版** | `https://business.nikkei.com/rss/sns/nb.rdf` | 高 | ビジネス全般 |

---

### 4. 📈 マーケティング

| メディア | RSS URL | 更新頻度 | 備考 |
|----------|---------|----------|------|
| **MarkeZine** | `https://markezine.jp/rss/new/20/index.xml` | 高 | マーケティング特化 |
| **ECzine** | `https://eczine.jp/rss/new/20/index.xml` | 高 | EC・コマース |
| **Web担当者Forum** | `https://webtan.impress.co.jp/rss` | 高 | Webマーケ・SEO |
| **Campaign Japan** | `https://www.campaignjapan.com/rss` | 中 | 広告・ブランディング |

---

### 5. 👨‍💻 開発・エンジニアリング

| メディア | RSS URL | 更新頻度 | 備考 |
|----------|---------|----------|------|
| **CodeZine** | `https://codezine.jp/rss/new/20/index.xml` | 高 | 開発者向け |
| **Qiita トレンド** | `https://qiita.com/popular-items/feed` | 非常に高 | コミュニティ動向 |
| **Zenn トレンド** | `https://zenn.dev/feed` | 高 | 技術記事 |
| **GitHub Blog** | `https://github.blog/feed/` | 中 | GitHub動向 |
| **Dev.to** | `https://dev.to/feed` | 非常に高 | グローバル開発者 |

---

### 6. 🌍 海外テック（英語）

| メディア | RSS URL | 更新頻度 | 備考 |
|----------|---------|----------|------|
| **TechCrunch (US)** | `https://techcrunch.com/feed/` | 非常に高 | 本家TechCrunch |
| **TechCrunch AI** | `https://techcrunch.com/category/artificial-intelligence/feed/` | 高 | AI特化 |
| **TechCrunch Startups** | `https://techcrunch.com/category/startups/feed/` | 高 | スタートアップ |
| **The Verge** | `https://www.theverge.com/rss/index.xml` | 非常に高 | テック全般 |
| **Wired** | `https://www.wired.com/feed/rss` | 高 | テック・カルチャー |
| **Hacker News** | `https://hnrss.org/frontpage` | 非常に高 | エンジニア話題 |
| **Ars Technica** | `https://feeds.arstechnica.com/arstechnica/index` | 高 | 深堀り系 |
| **VentureBeat AI** | `https://venturebeat.com/category/ai/feed/` | 高 | AI・ML特化 |

---

## 🎯 MORODAS向け推奨セット

### ▶️ 最小構成（まず始めるならこの5つ）

```
1. ITmedia AI+          → AI業務効率化の主戦場
2. TechCrunch Japan     → スタートアップ・テック動向
3. Ledge.ai             → AI特化日本語
4. 日経ビジネス         → ビジネス文脈
5. MarkeZine            → マーケティング視点
```

**n8n設定用:**
```javascript
const RSS_FEEDS = [
  { name: "ITmedia AI+", url: "https://rss.itmedia.co.jp/rss/2.0/ait.xml", category: "ai" },
  { name: "TechCrunch Japan", url: "https://jp.techcrunch.com/feed/", category: "tech" },
  { name: "Ledge.ai", url: "https://ledge.ai/feed/", category: "ai" },
  { name: "日経ビジネス", url: "https://business.nikkei.com/rss/sns/nb.rdf", category: "business" },
  { name: "MarkeZine", url: "https://markezine.jp/rss/new/20/index.xml", category: "marketing" },
];
```

---

### ▶️ フル構成（本格運用）

```javascript
const RSS_FEEDS_FULL = [
  // AI（最重要）
  { name: "ITmedia AI+", url: "https://rss.itmedia.co.jp/rss/2.0/ait.xml", category: "ai", priority: 1 },
  { name: "Ledge.ai", url: "https://ledge.ai/feed/", category: "ai", priority: 1 },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", category: "ai", priority: 2 },
  
  // テック総合
  { name: "TechCrunch Japan", url: "https://jp.techcrunch.com/feed/", category: "tech", priority: 1 },
  { name: "ITmedia エンタープライズ", url: "https://rss.itmedia.co.jp/rss/2.0/enterprise.xml", category: "tech", priority: 2 },
  { name: "Publickey", url: "https://www.publickey1.jp/atom.xml", category: "tech", priority: 2 },
  { name: "ZDNET Japan", url: "https://japan.zdnet.com/info/feed/", category: "tech", priority: 2 },
  
  // DX・ビジネス
  { name: "日経ビジネス", url: "https://business.nikkei.com/rss/sns/nb.rdf", category: "business", priority: 1 },
  { name: "ビジネス+IT", url: "https://www.sbbit.jp/rss/HotTopics.rss", category: "business", priority: 2 },
  { name: "デジタル庁", url: "https://www.digital.go.jp/rss/news.xml", category: "dx", priority: 3 },
  
  // マーケティング
  { name: "MarkeZine", url: "https://markezine.jp/rss/new/20/index.xml", category: "marketing", priority: 1 },
  { name: "Web担当者Forum", url: "https://webtan.impress.co.jp/rss", category: "marketing", priority: 2 },
  
  // 開発者向け
  { name: "Qiita トレンド", url: "https://qiita.com/popular-items/feed", category: "dev", priority: 2 },
  { name: "Zenn", url: "https://zenn.dev/feed", category: "dev", priority: 2 },
  
  // 海外（英語）
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "ai_en", priority: 2 },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", category: "ai_en", priority: 2 },
  { name: "Hacker News", url: "https://hnrss.org/frontpage", category: "dev_en", priority: 3 },
];
```

---

## 🔧 n8n RSS取得ノード設定

### HTTP Request ノード（RSS取得）

```json
{
  "parameters": {
    "method": "GET",
    "url": "={{ $json.url }}",
    "options": {
      "response": {
        "response": {
          "fullResponse": true
        }
      }
    }
  },
  "name": "Fetch RSS",
  "type": "n8n-nodes-base.httpRequest"
}
```

### XML ノード（パース）

```json
{
  "parameters": {
    "mode": "xmlToJson",
    "options": {}
  },
  "name": "Parse XML",
  "type": "n8n-nodes-base.xml"
}
```

### Code ノード（記事抽出）

```javascript
// RSS/Atomから記事を抽出
const items = [];
const data = $input.first().json;

// RSS 2.0 形式
if (data.rss?.channel?.item) {
  const rssItems = Array.isArray(data.rss.channel.item) 
    ? data.rss.channel.item 
    : [data.rss.channel.item];
  
  for (const item of rssItems.slice(0, 10)) { // 最新10件
    items.push({
      title: item.title,
      link: item.link,
      description: item.description?.replace(/<[^>]*>/g, '').slice(0, 500),
      pubDate: item.pubDate,
      source: data.rss.channel.title
    });
  }
}

// Atom 形式
if (data.feed?.entry) {
  const atomItems = Array.isArray(data.feed.entry) 
    ? data.feed.entry 
    : [data.feed.entry];
  
  for (const item of atomItems.slice(0, 10)) {
    items.push({
      title: item.title?.['#text'] || item.title,
      link: item.link?.['@_href'] || item.link,
      description: (item.summary || item.content)?.['#text']?.replace(/<[^>]*>/g, '').slice(0, 500),
      pubDate: item.published || item.updated,
      source: data.feed.title?.['#text'] || data.feed.title
    });
  }
}

return items.map(item => ({ json: item }));
```

---

## 📊 カテゴリ別キーワードフィルタ

News Agentが記事を分類する際のキーワード:

```javascript
const CATEGORY_KEYWORDS = {
  ai_efficiency: [
    "AI業務効率化", "自動化", "RPA", "ChatGPT", "生成AI", "LLM",
    "業務削減", "コスト削減", "DX推進", "デジタル化"
  ],
  jtc_dx: [
    "JTC", "大企業", "レガシー", "基幹システム", "CIO", 
    "デジタルトランスフォーメーション", "内製化", "SIer"
  ],
  marketing: [
    "マーケティング", "SNS", "コンテンツ", "SEO", "広告",
    "ブランディング", "リード獲得", "CV"
  ],
  startup: [
    "スタートアップ", "資金調達", "シリーズA", "VC", "エンジェル",
    "創業", "起業", "IPO"
  ],
  competitor: [
    "OpenClaw", "Remotion", "Cursor", "Claude", "Gemini",
    "個人開発", "ノーコード", "ローコード"
  ]
};
```

---

## ⚠️ 注意事項

1. **レート制限**: 同一サイトへの連続アクセスは1秒以上間隔を開ける
2. **時間帯**: 日本時間9:00〜10:00に実行推奨（記事が揃う時間）
3. **重複排除**: link をキーとして過去24時間の記事と重複チェック
4. **エラーハンドリング**: RSSが取得できない場合はスキップして続行
5. **文字コード**: UTF-8以外の場合は変換が必要な場合あり

---

## 🔍 RSSフィードの確認方法

```bash
# フィードの存在確認
curl -I "https://rss.itmedia.co.jp/rss/2.0/ait.xml"

# 内容確認（最初の50行）
curl -s "https://rss.itmedia.co.jp/rss/2.0/ait.xml" | head -50

# 記事数確認
curl -s "https://jp.techcrunch.com/feed/" | grep -c "<item>"
```

---

**以上**
