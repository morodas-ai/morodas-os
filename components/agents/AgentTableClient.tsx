"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Power, Edit, Trash2, Plus, ChevronRight } from "lucide-react";
import AgentDetailPanel from "./AgentDetailPanel";

interface Agent {
    id: string;
    name: string;
    type: string;
    description?: string | null;
    enabled: boolean;
    lastRunAt: string | null;
    updatedAt: string;
    keyCapabilities?: string | null;
    recommendedUses?: string | null;
}

interface AgentDetail {
    id: string;
    name: string;
    type: string;
    description: string | null;
    enabled: boolean;
    keyCapabilities: string | null;
    recommendedUses: string | null;
}

export default function AgentTableClient({ initialAgents }: { initialAgents: Agent[] }) {
    const router = useRouter();
    const [agents, setAgents] = useState(initialAgents);
    const [isCreating, setIsCreating] = useState(false);
    const [newAgent, setNewAgent] = useState({ name: "", type: "news" });
    const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);

    // initialAgentsプロップが変更された時にステートを同期
    useEffect(() => {
        setAgents(initialAgents);
    }, [initialAgents]);

    // エージェント詳細を取得
    const openAgentDetail = async (agent: Agent) => {
        try {
            const res = await fetch(`/api/agents/${agent.id}`);
            const { data } = await res.json();
            setSelectedAgent(data);
        } catch (error) {
            console.error("Failed to fetch agent detail:", error);
            // フォールバック: 基本情報で開く
            setSelectedAgent({
                id: agent.id,
                name: agent.name,
                type: agent.type,
                description: agent.description || null,
                enabled: agent.enabled,
                keyCapabilities: agent.keyCapabilities || null,
                recommendedUses: agent.recommendedUses || null,
            });
        }
    };

    // 有効/無効トグル
    const toggleEnabled = async (id: string, currentEnabled: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch(`/api/agents/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: !currentEnabled }),
            });
            setAgents(agents.map((a) => (a.id === id ? { ...a, enabled: !currentEnabled } : a)));
        } catch (error) {
            console.error("Failed to toggle agent:", error);
        }
    };

    // 削除
    const deleteAgent = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("本当に削除しますか？")) return;
        try {
            await fetch(`/api/agents/${id}`, { method: "DELETE" });
            setAgents(agents.filter((a) => a.id !== id));
        } catch (error) {
            console.error("Failed to delete agent:", error);
        }
    };

    // 新規作成
    const createAgent = async () => {
        if (!newAgent.name) return;
        try {
            const res = await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAgent),
            });
            const { data } = await res.json();
            setAgents([data, ...agents]);
            setNewAgent({ name: "", type: "news" });
            setIsCreating(false);
        } catch (error) {
            console.error("Failed to create agent:", error);
        }
    };

    return (
        <>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                {/* 新規作成フォーム */}
                {isCreating && (
                    <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm text-slate-400 mb-1">エージェント名</label>
                            <input
                                type="text"
                                value={newAgent.name}
                                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-emerald-500"
                                placeholder="例: My News Agent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">タイプ</label>
                            <select
                                value={newAgent.type}
                                onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50"
                            >
                                <option value="news">News Agent</option>
                                <option value="seo">SEO Agent</option>
                                <option value="social">Social Agent</option>
                                <option value="competitor">Competitor Agent</option>
                                <option value="growth">Growth Agent</option>
                                <option value="geo">GEO Agent</option>
                            </select>
                        </div>
                        <button onClick={createAgent} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg">
                            作成
                        </button>
                        <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white px-4 py-2">
                            キャンセル
                        </button>
                    </div>
                )}

                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 text-sm">
                        <tr>
                            <th className="p-4 font-medium">エージェント名</th>
                            <th className="p-4 font-medium">タイプ</th>
                            <th className="p-4 font-medium">最終実行</th>
                            <th className="p-4 font-medium">ステータス</th>
                            <th className="p-4 font-medium text-right">
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 ml-auto"
                                >
                                    <Plus size={16} /> 新規
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {agents.map((agent) => (
                            <tr
                                key={agent.id}
                                className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                                onClick={() => openAgentDetail(agent)}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                                            {agent.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-50">{agent.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-400 capitalize">{agent.type}</td>
                                <td className="p-4 text-slate-400">
                                    {agent.lastRunAt ? format(new Date(agent.lastRunAt), "MMM d, HH:mm") : "-"}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={(e) => toggleEnabled(agent.id, agent.enabled, e)}
                                        className={`flex items-center gap-2 px-2 py-1 rounded text-xs w-fit cursor-pointer ${agent.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-700 text-slate-400"
                                            }`}
                                    >
                                        <Power size={12} />
                                        {agent.enabled ? "稼働中" : "停止"}
                                    </button>
                                </td>
                                <td className="p-4 text-right flex gap-2 justify-end">
                                    <Link
                                        href={`/agents/${agent.id}`}
                                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={(e) => deleteAgent(agent.id, e)}
                                        className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <ChevronRight size={16} className="text-slate-500 mt-2" />
                                </td>
                            </tr>
                        ))}
                        {agents.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    エージェントがありません。上のテンプレートから作成してください。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* エージェント詳細パネル */}
            {selectedAgent && (
                <AgentDetailPanel
                    agent={selectedAgent}
                    onClose={() => setSelectedAgent(null)}
                />
            )}
        </>
    );
}

