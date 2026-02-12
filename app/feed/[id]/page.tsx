import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ReportDetailClient from "@/components/feed/ReportDetailClient";

export const dynamic = "force-dynamic";

async function getReport(id: string) {
  return await prisma.report.findUnique({
    where: { id },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  // JSONコンテンツをパース
  let content: {
    summary?: string;
    topics?: Array<{ title: string; content: string }>;
    insights?: Array<{ area: string; strategy: string; expected: string }>;
    recommendedActions?: string[];
    sns?: Array<{ platform: string; author: string; content: string; likes: number; retweets: number; replies: number }>;
    sources?: Array<{ name: string; url: string }>;
  } = {};

  try {
    content = JSON.parse(report.content);
  } catch {
    content = {};
  }

  const serializedReport = {
    ...report,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };

  return <ReportDetailClient report={serializedReport} content={content} />;
}
