import prisma from "@/lib/prisma";
import ContentManagerClient from "@/components/content/ContentManagerClient";

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

export default async function ContentPage() {
  const content = await getContent();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-50">コンテンツ管理</h1>
      </div>
      <ContentManagerClient initialContent={content} />
    </div>
  );
}
