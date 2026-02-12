import prisma from "../lib/prisma";
import { subDays } from "date-fns";

async function main() {
    console.log("🌱 MORODAS OS ダッシュボード初期データ投入開始...\n");

    // 既存データ確認
    const existingTasks = await prisma.task.count();
    const existingAgents = await prisma.agent.count();
    if (existingTasks > 1 || existingAgents > 0) {
        console.log(`⚠️  既存データあり（タスク: ${existingTasks}件, エージェント: ${existingAgents}件）`);
        console.log("   上書きを避けるため中断します。強制実行するには --force オプションを使用してください。");
        if (!process.argv.includes("--force")) {
            return;
        }
        console.log("   --force が指定されたため続行します。\n");
    }

    const now = new Date();

    // ===========================================
    // 1. エージェント（4件）
    // ===========================================
    console.log("📡 エージェント作成中...");
    const agents = await Promise.all([
        prisma.agent.upsert({
            where: { id: "agent-news" },
            update: {},
            create: {
                id: "agent-news",
                name: "News Agent",
                type: "news",
                description: "TechCrunch, AI-Scholarなどの最新AI記事を自動収集・要約し、Telegram/Discordに通知する",
                enabled: true,
                lastRunAt: subDays(now, 0), // 今日稼働
                keyCapabilities: JSON.stringify(["ニュース収集", "AI要約", "Telegram通知"]),
            },
        }),
        prisma.agent.upsert({
            where: { id: "agent-seo" },
            update: {},
            create: {
                id: "agent-seo",
                name: "SEO Agent",
                type: "seo",
                description: "ユニコ記事のSEO分析と改善提案。キーワードランキング追跡",
                enabled: true,
                lastRunAt: subDays(now, 1),
                keyCapabilities: JSON.stringify(["キーワード分析", "SEOスコア", "改善提案"]),
            },
        }),
        prisma.agent.upsert({
            where: { id: "agent-social" },
            update: {},
            create: {
                id: "agent-social",
                name: "Social Agent",
                type: "social",
                description: "X/Instagram/Noteのエンゲージメント分析とコンテンツ提案",
                enabled: true,
                lastRunAt: subDays(now, 2),
                keyCapabilities: JSON.stringify(["エンゲージメント分析", "投稿提案", "トレンド追跡"]),
            },
        }),
        prisma.agent.upsert({
            where: { id: "agent-growth" },
            update: {},
            create: {
                id: "agent-growth",
                name: "Growth Agent",
                type: "growth",
                description: "収益KPI追跡と成長戦略提案。法人化に向けた目標管理",
                enabled: false, // まだ未稼働
                keyCapabilities: JSON.stringify(["KPI追跡", "収益予測", "成長提案"]),
            },
        }),
    ]);
    console.log(`   ✅ ${agents.length}件のエージェント作成完了\n`);

    // ===========================================
    // 2. タスク（7件 - うち2件は停滞）
    // ===========================================
    console.log("📋 タスク作成中...");
    const tasks = await Promise.all([
        // 停滞タスク1（3日前から止まってる）
        prisma.task.create({
            data: {
                title: "Discord移行: Telegramの通知をDiscordに切り替え",
                description: "n8nの3ワークフロー（ニュース通知、トレンドコレクター、記事生成）の通知先をTelegramからDiscordに変更する",
                priority: "high",
                status: "in_progress",
                estimatedMinutes: 60,
                lastActivityAt: subDays(now, 3),
                agentType: "manual",
            },
        }),
        // 停滞タスク2（4日前から止まってる）
        prisma.task.create({
            data: {
                title: "VPS Kagoya RAM 4GB→8GBにアップグレード",
                description: "n8nとOpenClawの安定稼働のため、VPSメモリを増設する。Kagoyaコントロールパネルから変更",
                priority: "medium",
                status: "pending",
                estimatedMinutes: 15,
                lastActivityAt: subDays(now, 4),
                agentType: "manual",
            },
        }),
        // アクティブなタスク
        prisma.task.create({
            data: {
                title: "ユニコ記事のSEO最適化（上位10記事）",
                description: "アクセス上位10記事のメタディスクリプション・見出し構造を改善",
                priority: "high",
                status: "pending",
                estimatedMinutes: 120,
                lastActivityAt: now,
                agentId: "agent-seo",
                agentType: "seo",
            },
        }),
        prisma.task.create({
            data: {
                title: "X投稿スケジュール作成（今週分）",
                description: "AI記事を元にした投稿文案5本を作成し、スケジュール設定",
                priority: "medium",
                status: "pending",
                estimatedMinutes: 45,
                lastActivityAt: now,
                agentId: "agent-social",
                agentType: "social",
            },
        }),
        prisma.task.create({
            data: {
                title: "Note記事: AI導入コンサルの実践事例",
                description: "OpenText営業経験を活かしたAI導入コンサルの事例記事を執筆",
                priority: "medium",
                status: "pending",
                estimatedMinutes: 90,
                lastActivityAt: subDays(now, 1),
                agentType: "manual",
            },
        }),
        prisma.task.create({
            data: {
                title: "GCS同期スクリプトの自動化（cron設定）",
                description: "sync-memory-to-gcs.tsを毎日自動実行するようにcronまたはn8nで設定",
                priority: "low",
                status: "pending",
                estimatedMinutes: 30,
                lastActivityAt: now,
                agentType: "manual",
            },
        }),
        prisma.task.create({
            data: {
                title: "コンサル案件: クライアントA 初回ヒアリング準備",
                description: "面接準備シートを使ってヒアリング質問リストを作成",
                priority: "high",
                status: "pending",
                estimatedMinutes: 60,
                dueDate: subDays(now, -2), // 2日後が期限
                lastActivityAt: now,
                agentType: "manual",
            },
        }),
    ]);
    console.log(`   ✅ ${tasks.length}件のタスク作成完了（うち2件は停滞データ）\n`);

    // ===========================================
    // 3. 今月の収益データ
    // ===========================================
    console.log("💰 収益データ作成中...");
    const revenue = await prisma.monthlyRevenue.upsert({
        where: {
            year_month: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
            },
        },
        update: {},
        create: {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            noteRevenue: 15000,
            consultingRevenue: 80000,
            developmentRevenue: 50000,
            otherRevenue: 0,
            totalRevenue: 145000,
            targetRevenue: 1000000,
        },
    });
    console.log(`   ✅ ${revenue.year}年${revenue.month}月の収益データ作成完了（¥${revenue.totalRevenue.toLocaleString()} / 目標¥${revenue.targetRevenue.toLocaleString()}）\n`);

    // ===========================================
    // 4. メトリクス
    // ===========================================
    console.log("📊 メトリクス作成中...");
    await Promise.all([
        prisma.metric.create({
            data: {
                name: "x_followers",
                value: 847,
                change: 23,
                changePercent: 2.8,
                target: 10000,
            },
        }),
        prisma.metric.create({
            data: {
                name: "note_weekly_pv",
                value: 3240,
                change: 580,
                changePercent: 21.8,
                target: 10000,
            },
        }),
    ]);
    console.log("   ✅ メトリクス作成完了（X: 847フォロワー, Note: 3,240 PV/週）\n");

    // ===========================================
    // 5. 停滞チェック実行（アラート自動生成）
    // ===========================================
    console.log("🔍 停滞チェック実行中...");
    const { checkStagnation } = await import("../lib/monitor");
    const stagnantCount = await checkStagnation();
    console.log(`   ✅ ${stagnantCount}件の停滞タスクを検知してアラート作成完了\n`);

    // ===========================================
    // 結果サマリー
    // ===========================================
    console.log("=".repeat(50));
    console.log("🎉 ダッシュボード初期データ投入完了！");
    console.log("=".repeat(50));
    console.log(`  エージェント: ${agents.length}件`);
    console.log(`  タスク:       ${tasks.length}件（うち停滞${stagnantCount}件）`);
    console.log(`  収益:         ¥${revenue.totalRevenue.toLocaleString()}`);
    console.log(`  メトリクス:   2件`);
    console.log(`  アラート:     ${stagnantCount}件（自動生成）`);
    console.log("\n  → http://localhost:3001/dashboard で確認してください");
}

main()
    .catch((e) => {
        console.error("❌ エラー:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
