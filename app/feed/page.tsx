import prisma from "@/lib/prisma";
import FeedClient from "@/components/feed/FeedClient";

export const dynamic = "force-dynamic";

async function getReports() {
  const reports = await prisma.report.findMany({
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reports.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

async function getActiveAlerts() {
  return await prisma.alert.findMany({
    where: {
      isDismissed: false,
      severity: "critical",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });
}

export default async function FeedPage() {
  const [reports, alerts] = await Promise.all([
    getReports(),
    getActiveAlerts(),
  ]);

  return <FeedClient initialReports={reports} initialAlerts={alerts} />;
}
