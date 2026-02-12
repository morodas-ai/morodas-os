import prisma from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { checkStagnation } from "@/lib/monitor";

async function getDashboardData() {
  // 停滞チェックを実行（最新の状態に更新）
  await checkStagnation();

  const [alerts, tasks, metrics, monthlyRevenue, agents] = await Promise.all([
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
  ]);

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
  };
}

export default async function DashboardPage() {
  const {
    alerts,
    tasks,
    metricsMap,
    monthlyRevenue,
    agents,
  } = await getDashboardData();

  return (
    <DashboardClient
      initialAlerts={alerts}
      initialTasks={tasks}
      agents={agents}
      metricsMap={metricsMap}
      monthlyRevenue={monthlyRevenue}
    />
  );
}
