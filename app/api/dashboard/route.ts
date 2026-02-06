import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: ダッシュボードデータを取得
export async function GET() {
    // 並列でデータを取得
    const [alerts, tasks, metrics, monthlyRevenue, agents, settings] = await Promise.all([
        // アクティブなアラート
        prisma.alert.findMany({
            where: { isDismissed: false },
            orderBy: { severity: "desc" },
            take: 5,
        }),

        // 今日のタスク
        prisma.task.findMany({
            where: {
                status: { in: ["pending", "in_progress"] },
            },
            orderBy: [
                { priority: "asc" }, // high が先
                { createdAt: "desc" },
            ],
            take: 5,
        }),

        // 最新のメトリクス
        prisma.metric.findMany({
            orderBy: { date: "desc" },
            take: 10,
        }),

        // 今月の収益
        prisma.monthlyRevenue.findFirst({
            where: {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
            },
        }),

        // エージェント稼働状況
        prisma.agent.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                enabled: true,
                lastRunAt: true,
                _count: {
                    select: { reports: true },
                },
            },
            orderBy: { lastRunAt: "desc" },
        }),

        // 設定（法人化日等）
        prisma.setting.findMany(),
    ]);

    // 法人化までの日数を計算
    const incorporationSetting = settings.find(s => s.key === "incorporation_date");
    let daysToIncorporation = null;
    if (incorporationSetting) {
        const targetDate = new Date(incorporationSetting.value);
        const today = new Date();
        daysToIncorporation = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
        alerts,
        tasks,
        metrics,
        monthlyRevenue,
        agents: agents.map(a => ({
            ...a,
            reportCount: a._count.reports,
        })),
        daysToIncorporation,
        settings,
    });
}
