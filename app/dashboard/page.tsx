import prisma from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

async function getDashboardData() {
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
        { priority: "asc" },
        { createdAt: "desc" },
      ],
      take: 10,
    }),

    // 最新のメトリクス
    prisma.metric.findMany({
      orderBy: { date: "desc" },
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

    // 設定
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

  // メトリクスをマップに変換
  const metricsMap = Object.fromEntries(metrics.map(m => [m.name, m]));

  // シリアライズ
  const serializedAgents = agents.map(a => ({
    ...a,
    lastRunAt: a.lastRunAt?.toISOString() || null,
  }));

  const serializedTasks = tasks.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    lastActivityAt: t.lastActivityAt.toISOString(),
    dueDate: t.dueDate?.toISOString() || null,
  }));

  return {
    alerts,
    tasks: serializedTasks,
    metricsMap,
    monthlyRevenue,
    agents: serializedAgents,
    daysToIncorporation,
  };
}

export default async function DashboardPage() {
  const {
    alerts,
    tasks,
    metricsMap,
    monthlyRevenue,
    agents,
    daysToIncorporation,
  } = await getDashboardData();

  return (
    <DashboardClient
      initialAlerts={alerts}
      initialTasks={tasks}
      agents={agents}
      metricsMap={metricsMap}
      monthlyRevenue={monthlyRevenue}
      daysToIncorporation={daysToIncorporation}
    />
  );
}
