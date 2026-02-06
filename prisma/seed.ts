import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ===========================================
  // エージェントのシード
  // ===========================================
  const agents = await Promise.all([
    prisma.agent.upsert({
      where: { id: "agent-news" },
      update: {},
      create: {
        id: "agent-news",
        name: "News Agent",
        type: "news",
        description: "日次ニュースサマリーを作成し、ビジネスに関連するトピックを抽出",
        enabled: true,
        config: JSON.stringify({ sources: ["techcrunch", "nikkei", "itmedia"] }),
        lastRunAt: new Date("2026-02-01T13:42:00"),
      },
    }),
    prisma.agent.upsert({
      where: { id: "agent-social" },
      update: {},
      create: {
        id: "agent-social",
        name: "Social Listening Agent",
        type: "social",
        description: "X/YouTubeのトレンドを監視し、関連する話題を分析",
        enabled: true,
        config: JSON.stringify({ keywords: ["OpenClaw", "Remotion", "AI業務効率化"] }),
        lastRunAt: new Date("2026-02-01T13:37:00"),
      },
    }),
    prisma.agent.upsert({
      where: { id: "agent-competitor" },
      update: {},
      create: {
        id: "agent-competitor",
        name: "Competitor Analysis Agent",
        type: "competitor",
        description: "競合の動向を監視し、差別化戦略を提案",
        enabled: true,
        config: JSON.stringify({ competitors: ["AIのちかみち", "Aircle", "ユニコ"] }),
        lastRunAt: new Date("2026-02-01T13:40:00"),
      },
    }),
    prisma.agent.upsert({
      where: { id: "agent-growth" },
      update: {},
      create: {
        id: "agent-growth",
        name: "Growth Metrics Agent",
        type: "growth",
        description: "成長指標を分析し、改善提案を生成",
        enabled: true,
        config: JSON.stringify({ platforms: ["x", "note", "youtube"] }),
        lastRunAt: new Date("2026-02-01T13:39:00"),
      },
    }),
    prisma.agent.upsert({
      where: { id: "agent-geo" },
      update: {},
      create: {
        id: "agent-geo",
        name: "GEO Agent",
        type: "geo",
        description: "AI検索エンジン最適化の分析",
        enabled: true,
        config: JSON.stringify({ models: ["chatgpt", "perplexity", "gemini"] }),
        lastRunAt: new Date("2026-02-01T13:39:00"),
      },
    }),
    prisma.agent.upsert({
      where: { id: "agent-seo" },
      update: {},
      create: {
        id: "agent-seo",
        name: "SEO Agent",
        type: "seo",
        description: "キーワード分析とSEOパフォーマンス追跡",
        enabled: true,
        config: JSON.stringify({ domain: "note.com/morodas" }),
        lastRunAt: new Date("2026-02-01T14:00:00"),
      },
    }),
    prisma.agent.upsert({
      where: { id: "agent-socialmedia" },
      update: {},
      create: {
        id: "agent-socialmedia",
        name: "Social Media Agent",
        type: "socialmedia",
        description: "SNS投稿戦略の立案とコンテンツカレンダー管理",
        enabled: true,
        config: JSON.stringify({ accounts: ["@morodas_ai"] }),
        lastRunAt: new Date("2026-02-01T13:38:00"),
      },
    }),
  ]);

  console.log(`✅ Created ${agents.length} agents`);

  // ===========================================
  // ツールのシード（NoimosAI互換）
  // ===========================================
  const tools = await Promise.all([
    prisma.tool.upsert({
      where: { provider: "x" },
      update: {},
      create: {
        id: "tool-x",
        name: "X (Twitter)",
        provider: "x",
        icon: "Twitter",
        description: "ツイートの投稿・監視、トレンド分析",
      },
    }),
    prisma.tool.upsert({
      where: { provider: "google_drive" },
      update: {},
      create: {
        id: "tool-gdrive",
        name: "Google Drive",
        provider: "google_drive",
        icon: "FolderOpen",
        description: "ドキュメント・スプレッドシートへのアクセス",
      },
    }),
    prisma.tool.upsert({
      where: { provider: "slack" },
      update: {},
      create: {
        id: "tool-slack",
        name: "Slack",
        provider: "slack",
        icon: "MessageSquare",
        description: "チャンネルへの通知・メッセージ送信",
      },
    }),
    prisma.tool.upsert({
      where: { provider: "youtube" },
      update: {},
      create: {
        id: "tool-youtube",
        name: "YouTube",
        provider: "youtube",
        icon: "Youtube",
        description: "動画分析・トレンド監視",
      },
    }),
    prisma.tool.upsert({
      where: { provider: "google_search" },
      update: {},
      create: {
        id: "tool-gsearch",
        name: "Google Search",
        provider: "google_search",
        icon: "Search",
        description: "Web検索・SEO分析",
      },
    }),
    prisma.tool.upsert({
      where: { provider: "notion" },
      update: {},
      create: {
        id: "tool-notion",
        name: "Notion",
        provider: "notion",
        icon: "FileText",
        description: "ナレッジベース・ドキュメント連携",
      },
    }),
    prisma.tool.upsert({
      where: { provider: "facebook" },
      update: {},
      create: {
        id: "tool-facebook",
        name: "Facebook",
        provider: "facebook",
        icon: "Facebook",
        description: "ページ投稿・インサイト分析",
      },
    }),
  ]);

  console.log(`✅ Created ${tools.length} tools`);

  // ===========================================
  // エージェント-ツール連携のシード
  // ===========================================
  const agentTools = await Promise.all([
    // News Agent → Google Search, X
    prisma.agentTool.upsert({
      where: { agentId_toolId: { agentId: "agent-news", toolId: "tool-gsearch" } },
      update: {},
      create: { agentId: "agent-news", toolId: "tool-gsearch", isConnected: true },
    }),
    prisma.agentTool.upsert({
      where: { agentId_toolId: { agentId: "agent-news", toolId: "tool-x" } },
      update: {},
      create: { agentId: "agent-news", toolId: "tool-x", isConnected: false },
    }),
    // Social Listening → X, YouTube
    prisma.agentTool.upsert({
      where: { agentId_toolId: { agentId: "agent-social", toolId: "tool-x" } },
      update: {},
      create: { agentId: "agent-social", toolId: "tool-x", isConnected: true },
    }),
    prisma.agentTool.upsert({
      where: { agentId_toolId: { agentId: "agent-social", toolId: "tool-youtube" } },
      update: {},
      create: { agentId: "agent-social", toolId: "tool-youtube", isConnected: true },
    }),
    // SEO Agent → Google Search
    prisma.agentTool.upsert({
      where: { agentId_toolId: { agentId: "agent-seo", toolId: "tool-gsearch" } },
      update: {},
      create: { agentId: "agent-seo", toolId: "tool-gsearch", isConnected: true },
    }),
  ]);

  console.log(`✅ Created ${agentTools.length} agent-tool connections`);

  // ===========================================
  // トリガーのシード
  // ===========================================
  const triggers = await Promise.all([
    prisma.trigger.upsert({
      where: { id: "trigger-news-daily" },
      update: {},
      create: {
        id: "trigger-news-daily",
        agentId: "agent-news",
        name: "毎日朝9時",
        type: "schedule",
        frequency: "daily",
        hour: 9,
        minute: 0,
        enabled: true,
      },
    }),
    prisma.trigger.upsert({
      where: { id: "trigger-seo-weekly" },
      update: {},
      create: {
        id: "trigger-seo-weekly",
        agentId: "agent-seo",
        name: "毎週月曜10時",
        type: "schedule",
        frequency: "weekly",
        dayOfWeek: 1,
        hour: 10,
        minute: 0,
        enabled: true,
      },
    }),
    prisma.trigger.upsert({
      where: { id: "trigger-social-weekly" },
      update: {},
      create: {
        id: "trigger-social-weekly",
        agentId: "agent-social",
        name: "毎週水曜15時",
        type: "schedule",
        frequency: "weekly",
        dayOfWeek: 3,
        hour: 15,
        minute: 0,
        enabled: true,
      },
    }),
  ]);

  console.log(`✅ Created ${triggers.length} triggers`);

  // ===========================================
  // エージェント実行履歴のシード（既存エージェント用）
  // ===========================================
  const agentRuns = await Promise.all([
    prisma.agentRun.upsert({
      where: { id: "run-news-1" },
      update: {},
      create: {
        id: "run-news-1",
        agentId: "agent-news",
        status: "completed",
        duration: 45,
        prompt: "あなたはニュース分析のエキスパートです。以下のソースから最新ニュースを収集し、ビジネスに関連するトピックを抽出してください。",
        output: JSON.stringify({ reportId: "report-1", itemsProcessed: 24 }),
        createdAt: new Date("2026-02-01T13:42:00"),
      },
    }),
    prisma.agentRun.upsert({
      where: { id: "run-news-2" },
      update: {},
      create: {
        id: "run-news-2",
        agentId: "agent-news",
        status: "completed",
        duration: 38,
        prompt: "あなたはニュース分析のエキスパートです。",
        output: JSON.stringify({ itemsProcessed: 18 }),
        createdAt: new Date("2026-02-02T09:00:00"),
      },
    }),
    prisma.agentRun.upsert({
      where: { id: "run-social-1" },
      update: {},
      create: {
        id: "run-social-1",
        agentId: "agent-social",
        status: "completed",
        duration: 62,
        prompt: "XとYouTubeのトレンドを分析し、ビジネスに関連する話題を特定してください。",
        output: JSON.stringify({ reportId: "report-2" }),
        createdAt: new Date("2026-02-01T13:37:00"),
      },
    }),
    prisma.agentRun.upsert({
      where: { id: "run-seo-failed" },
      update: {},
      create: {
        id: "run-seo-failed",
        agentId: "agent-seo",
        status: "failed",
        duration: 12,
        error: "Google Search API rate limit exceeded",
        createdAt: new Date("2026-02-03T10:00:00"),
      },
    }),
  ]);

  console.log(`✅ Created ${agentRuns.length} agent runs`);

  // ===========================================
  // レポートのシード
  // ===========================================
  const reports = await Promise.all([
    prisma.report.upsert({
      where: { id: "report-1" },
      update: {},
      create: {
        id: "report-1",
        agentId: "agent-news",
        title: "MORODAS日次ニュースサマリー",
        description: "AIによる業務効率化やJTC（日本型大企業）のDX変革、社会経済分析に関する2026年2月1日付の日次レポートを作成しました。",
        status: "review",
        workspace: "Default Workspace",
        content: JSON.stringify({
          summary: "現在の情勢分析、AIによる業務効率化への大規模投入が加速する一方、労働時間短縮に逆行する「ジェボンズのパラドックス」への懸念や、JTC特有の「名ばかりCIO」問題によるDX推進の遅延が顕著になっています。",
          topics: [
            { title: "AIによる業務効率化：生産性のパラドックス", content: "大規模言語モデル（LLM）の業務導入が急速に進む一方、実際の労働時間短縮には繋がっていないケースが多発。" },
            { title: "JTCDX変革：「名ばかりCIO」とデジタル格差", content: "国内大企業におけるCIO（最高情報責任者）の多くが、実質的な権限を持たない「名ばかりCIO」であることが調査で判明。" },
            { title: "社会経済分析：企業価値から「社会的インパクト」へ", content: "2026年以降、企業評価の軸が「短期利益」から「社会的インパクト」へシフトする兆候。" },
          ],
          insights: [
            { area: "業務効率", strategy: "ツール徹底 + 実績の可視化", expected: "「AIで200人月削減」の再現性を証明" },
            { area: "権威性確保", strategy: "JTC向けホワイトペーパー発行", expected: "法人向けリード獲得" },
          ],
          recommendedActions: ["「ジェボンズのパラドックス」に言及したnote記事の作成", "「名ばかりCIO」を題材としたXスレッドの投稿"],
          sources: [{ name: "TechCrunch Japan", url: "https://techcrunch.com" }],
        }),
        createdAt: new Date("2026-02-01T13:42:00"),
      },
    }),
    prisma.report.upsert({
      where: { id: "report-2" },
      update: {},
      create: {
        id: "report-2",
        agentId: "agent-social",
        title: "AI・OpenClaw・Remotionトレンド分析",
        description: "XやYouTubeにおけるAIエージェント「OpenClaw」や動画生成ツール「Remotion」の最新トレンドを調査・分析しました。",
        status: "review",
        workspace: "Default Workspace",
        content: JSON.stringify({
          summary: "OpenClawの言及数が爆発的に増加中。Remotionは技術者コミュニティで高い関心。",
          trends: [
            { keyword: "OpenClaw", status: "上昇（爆発的）", notes: "GitHubスター数10万突破" },
            { keyword: "Remotion", status: "安定", notes: "動画制作の自動化に注目" },
          ],
          sentiment: { positive: 72, neutral: 15, negative: 13 },
        }),
        createdAt: new Date("2026-02-01T13:37:00"),
      },
    }),
    prisma.report.upsert({
      where: { id: "report-3" },
      update: {},
      create: {
        id: "report-3",
        agentId: "agent-competitor",
        title: "競合分析とJTCハック戦略",
        description: "AI競合（AIのちかみち、Aircle、ユニコ🦄）のXおよびYouTubeでの活動を分析。競合が個人向け副業や学生向けツールに注力する中、MORODASはJTC特化で差別化。",
        status: "review",
        workspace: "Default Workspace",
        content: JSON.stringify({
          summary: "競合分析の結果、AIのちかみち、Aircle、ユニコ🦄は主に個人・学生・スタートアップ向けに注力しており、JTC（日本型大企業）向けAI業務効率化市場は競合が少ないブルーオーシャンであることが判明。MORODASの「200人月削減」実績が差別化の鍵となる。",
          topics: [
            { title: "競合ポジショニング分析", content: "AIのちかみちは個人向けAI副業に特化、Aircleは学生向けツール提供、ユニコはスタートアップ支援が主軸。いずれもJTC市場への本格参入は見られない。" },
            { title: "JTC市場の空白地帯", content: "国内大企業のAI導入は「PoC止まり」が多く、実運用まで伴走できるプレイヤーが不足。特に「業務効率化の定量効果」を示せるコンサルタントは希少。" },
          ],
          insights: [
            { area: "差別化戦略", strategy: "「200人月削減」の実績を前面に", expected: "JTC意思決定者への訴求力向上" },
            { area: "競合優位性", strategy: "JTC特化コンテンツの継続発信", expected: "市場でのポジション確立" },
          ],
          recommendedActions: [
            "JTC向けホワイトペーパー「AI業務効率化ROI算出ガイド」の作成",
            "競合3社の動向をウォッチするリスト作成（X, note）",
          ],
          competitors: [
            { name: "AIのちかみち", focus: "個人向けAI副業", threat: "低" },
            { name: "Aircle", focus: "学生向け", threat: "低" },
            { name: "ユニコ", focus: "スタートアップ", threat: "中" },
          ],
          sources: [{ name: "X/Twitter分析", url: "https://x.com" }],
        }),
        createdAt: new Date("2026-02-01T13:40:00"),
      },
    }),
  ]);

  console.log(`✅ Created ${reports.length} reports`);

  // ===========================================
  // タスクのシード
  // ===========================================
  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: "task-1" },
      update: {},
      create: {
        id: "task-1",
        title: "note記事の最終確認",
        description: "SEO Agentが生成した下書きの最終確認と公開",
        priority: "high",
        status: "pending",
        estimatedMinutes: 45,
        agentType: "seo",
        lastActivityAt: new Date(),
      },
    }),
    prisma.task.upsert({
      where: { id: "task-2" },
      update: {},
      create: {
        id: "task-2",
        title: "クライアント商談準備",
        description: "14時からの商談に向けた資料確認",
        priority: "medium",
        status: "done",
        estimatedMinutes: 30,
        completedAt: new Date(),
        lastActivityAt: new Date(),
      },
    }),
    prisma.task.upsert({
      where: { id: "task-3" },
      update: {},
      create: {
        id: "task-3",
        title: "Xスレッド投稿（JTCテーマ）",
        description: "「名ばかりCIO」をテーマにしたスレッドを投稿",
        priority: "medium",
        status: "pending",
        estimatedMinutes: 20,
        agentType: "socialmedia",
        lastActivityAt: new Date(),
      },
    }),
    prisma.task.upsert({
      where: { id: "task-4" },
      update: {},
      create: {
        id: "task-4",
        title: "JTCリサーチ",
        description: "大企業のDX事例調査",
        priority: "medium",
        status: "stagnant",
        estimatedMinutes: 120,
        lastActivityAt: new Date("2026-02-03T10:00:00"), // 2日前
        stagnantDays: 2,
      },
    }),
    prisma.task.upsert({
      where: { id: "task-5" },
      update: {},
      create: {
        id: "task-5",
        title: "note記事下書き",
        description: "ジェボンズのパラドックスに関する記事",
        priority: "high",
        status: "stagnant",
        estimatedMinutes: 60,
        lastActivityAt: new Date("2026-02-04T10:00:00"), // 1日前
        stagnantDays: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // ===========================================
  // アラートのシード（停滞検知）
  // ===========================================
  const alerts = await Promise.all([
    prisma.alert.upsert({
      where: { id: "alert-1" },
      update: {},
      create: {
        id: "alert-1",
        type: "stagnation",
        severity: "critical",
        title: "タスク「JTCリサーチ」が2日間停止中",
        message: "最終更新: 2026/02/03 - 再開が必要です",
        relatedType: "task",
        relatedId: "task-4",
        isRead: false,
        isDismissed: false,
      },
    }),
    prisma.alert.upsert({
      where: { id: "alert-2" },
      update: {},
      create: {
        id: "alert-2",
        type: "stagnation",
        severity: "warning",
        title: "タスク「note記事下書き」が1日間停止中",
        message: "最終更新: 2026/02/04 - 確認をお勧めします",
        relatedType: "task",
        relatedId: "task-5",
        isRead: false,
        isDismissed: false,
      },
    }),
  ]);

  console.log(`✅ Created ${alerts.length} alerts`);

  // ===========================================
  // メトリクスのシード
  // ===========================================
  const metrics = await Promise.all([
    prisma.metric.upsert({
      where: { id: "metric-followers" },
      update: {},
      create: {
        id: "metric-followers",
        name: "x_followers",
        value: 42,
        change: 2,
        changePercent: 5.0,
        target: 10000,
        date: new Date(),
      },
    }),
    prisma.metric.upsert({
      where: { id: "metric-notepv" },
      update: {},
      create: {
        id: "metric-notepv",
        name: "note_weekly_pv",
        value: 120,
        change: 16,
        changePercent: 15.4,
        target: 1000,
        date: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${metrics.length} metrics`);

  // ===========================================
  // 月次収益のシード
  // ===========================================
  const monthlyRevenue = await prisma.monthlyRevenue.upsert({
    where: { id: "monthly-2026-02" },
    update: {},
    create: {
      id: "monthly-2026-02",
      year: 2026,
      month: 2,
      noteRevenue: 0,
      consultingRevenue: 0,
      developmentRevenue: 0,
      otherRevenue: 0,
      totalRevenue: 0,
      targetRevenue: 1000000,
    },
  });

  console.log(`✅ Created monthly revenue record`);

  // ===========================================
  // 設定のシード
  // ===========================================
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: "incorporation_date" },
      update: {},
      create: {
        key: "incorporation_date",
        value: "2026-04-01",
        description: "法人設立予定日",
      },
    }),
    prisma.setting.upsert({
      where: { key: "stagnation_threshold_days" },
      update: {},
      create: {
        key: "stagnation_threshold_days",
        value: "2",
        description: "タスクが停滞と判断されるまでの日数",
      },
    }),
  ]);

  console.log(`✅ Created ${settings.length} settings`);

  // ===========================================
  // クライアントのシード
  // ===========================================
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "client-1" },
      update: {},
      create: {
        id: "client-1",
        name: "田中一郎",
        company: "株式会社テックスタート",
        email: "tanaka@techstart.co.jp",
        stage: "lead",
        dealValue: 500000,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-2" },
      update: {},
      create: {
        id: "client-2",
        name: "佐藤花子",
        company: "グローバル商事",
        email: "sato@global.co.jp",
        stage: "negotiating",
        dealValue: 1200000,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-3" },
      update: {},
      create: {
        id: "client-3",
        name: "山田太郎",
        company: "AI Solutions Inc",
        email: "yamada@ai-solutions.jp",
        stage: "proposed",
        dealValue: 800000,
      },
    }),
    prisma.client.upsert({
      where: { id: "client-4" },
      update: {},
      create: {
        id: "client-4",
        name: "鈴木次郎",
        company: "フューチャーワークス",
        email: "suzuki@future-works.co.jp",
        stage: "won",
        dealValue: 2500000,
      },
    }),
  ]);

  console.log(`✅ Created ${clients.length} clients`);

  // ===========================================
  // コンテンツのシード
  // ===========================================
  const contents = await Promise.all([
    prisma.content.upsert({
      where: { id: "content-1" },
      update: {},
      create: {
        id: "content-1",
        title: "2026年のAIトレンド10選",
        platform: "x",
        type: "thread",
        status: "published",
        publishedAt: new Date("2026-02-01"),
      },
    }),
    prisma.content.upsert({
      where: { id: "content-2" },
      update: {},
      create: {
        id: "content-2",
        title: "MORODAS OSの使い方ガイド",
        platform: "youtube",
        type: "video",
        status: "review",
        scheduledAt: new Date("2026-02-10"),
      },
    }),
    prisma.content.upsert({
      where: { id: "content-3" },
      update: {},
      create: {
        id: "content-3",
        title: "エージェントワークフロー解説",
        platform: "note",
        type: "article",
        status: "draft",
      },
    }),
  ]);

  console.log(`✅ Created ${contents.length} contents`);

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
