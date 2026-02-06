import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AgentEditorClient from "@/components/agents/AgentEditorClient";

export default async function AgentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
  });

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <h2 className="text-xl mb-4">エージェントが見つかりません</h2>
        <Link href="/agents" className="text-emerald-500 hover:underline">エージェント一覧に戻る</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/agents" className="flex items-center text-slate-400 hover:text-emerald-500 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        エージェント一覧に戻る
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-50">エージェント編集: {agent.name}</h1>
      </div>

      <AgentEditorClient agent={agent} />
    </div>
  );
}
