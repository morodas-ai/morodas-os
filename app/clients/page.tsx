import prisma from "@/lib/prisma";
import KanbanBoardClient from "@/components/crm/KanbanBoardClient";

export const dynamic = "force-dynamic";

async function getClients() {
  const clients = await prisma.client.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    stage: c.stage,
    dealValue: c.dealValue,
  }));
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary-400">クライアントCRM</h1>
        <p className="text-muted text-sm mt-1">リードから成約までパイプラインを管理</p>
      </div>
      <KanbanBoardClient initialClients={clients} />
    </div>
  );
}
