import prisma from "@/lib/prisma";
import ContentPageTabs from "@/components/content/ContentPageTabs";

export const dynamic = "force-dynamic";

async function getContent() {
  const content = await prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return content.map((c) => ({
    id: c.id,
    title: c.title,
    platform: c.platform,
    type: c.type,
    status: c.status,
    scheduledAt: c.scheduledAt?.toISOString() || null,
    publishedAt: c.publishedAt?.toISOString() || null,
  }));
}

async function getPipelineIdeas() {
  const ideas = await prisma.contentIdea.findMany({
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
  });

  return ideas.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    batchDate: i.batchDate.toISOString(),
  }));
}

export default async function ContentPage() {
  const [content, ideas] = await Promise.all([
    getContent(),
    getPipelineIdeas(),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-surface-50">コンテンツ管理</h1>
      </div>
      <ContentPageTabs initialContent={content} initialIdeas={ideas} />
    </div>
  );
}
