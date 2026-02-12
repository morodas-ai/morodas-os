"use client";

import { MoreHorizontal, Play, Pause, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import Link from "next/link";
import type { Agent } from "@/types";

interface AgentListTableProps {
    agents: Agent[];
    onToggleStatus: (id: string, enabled: boolean) => void;
    onDelete: (id: string) => void;
    onSelectAgent?: (agent: Agent) => void;
}

export default function AgentListTable({ agents, onToggleStatus, onDelete, onSelectAgent }: AgentListTableProps) {
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    return (
        <div className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-primary-50 text-muted text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4 font-semibold">名前</th>
                        <th className="p-4 font-semibold">ワークスペース</th>
                        <th className="p-4 font-semibold">最終実行</th>
                        <th className="p-4 font-semibold">ステータス</th>
                        <th className="p-4 font-semibold text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 text-sm">
                    {agents.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-muted">
                                エージェントが見つかりません。上のテンプレートから作成してください。
                            </td>
                        </tr>
                    ) : (
                        agents.map((agent) => (
                            <tr
                                key={agent.id}
                                className="group hover:bg-primary-50/50 transition-colors cursor-pointer"
                                onClick={() => onSelectAgent?.(agent)}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${agent.enabled ? "bg-primary-100 text-primary-600" : "bg-primary-50 text-muted"
                                            }`}>
                                            {agent.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-foreground group-hover:text-primary-500 transition-colors">
                                            {agent.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-muted">
                                    デフォルト
                                </td>
                                <td className="p-4 text-muted font-mono text-xs">
                                    {agent.lastRunAt ? format(new Date(agent.lastRunAt), "MMM d, HH:mm") : "未実行"}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleStatus(agent.id, !agent.enabled); }}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${agent.enabled
                                            ? "bg-primary-100 text-primary-600 hover:bg-primary-200"
                                            : "bg-primary-50 text-muted hover:bg-primary-100"
                                            }`}
                                    >
                                        {agent.enabled ? (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                                稼働中
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                停止中
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/agents/${agent.id}`} onClick={(e) => e.stopPropagation()}>
                                            <button className="p-2 hover:bg-primary-50 rounded-lg text-muted hover:text-foreground transition-colors" title="編集">
                                                <Edit size={16} />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
                                            className="p-2 hover:bg-red-50 rounded-lg text-muted hover:text-red-400 transition-colors"
                                            title="削除"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

