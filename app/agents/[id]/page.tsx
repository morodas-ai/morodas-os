import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AgentEditorClient from "@/components/agents/AgentEditorClient";
import AgentDetailPanel from "@/components/agents/AgentDetailPanel";

export default async function AgentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
  });

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted">
        <h2 className="text-xl mb-4">エージェントが見つかりません</h2>
        <Link href="/agents" className="text-primary-500 hover:underline">エージェント一覧に戻る</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/agents" className="flex items-center text-muted hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        エージェント一覧に戻る
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-surface-50">エージェント編集: {agent.name}</h1>
      </div>

      {/* Agent Editor */}
      <AgentEditorClient agent={{
        ...agent,
        lastRunAt: agent.lastRunAt?.toISOString() ?? null,
        updatedAt: agent.updatedAt?.toISOString(),
        config: agent.config ?? undefined,
      }} />

      {/* 4-Tab Detail (Tools, Triggers, Runs, General) */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-surface-200 mb-4">詳細情報</h2>
        <AgentDetailPanel agentId={id} />
      </div>
    </div>
  );
}
