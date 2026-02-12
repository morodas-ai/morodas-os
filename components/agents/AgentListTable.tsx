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
        <div className="bg-sidebar/50 rounded-xl border border-sidebar-hover/50 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-foreground/50 text-muted text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4 font-semibold">Title</th>
                        <th className="p-4 font-semibold">Workspace</th>
                        <th className="p-4 font-semibold">Last Run</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-sidebar-hover/50 text-sm">
                    {agents.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-surface-500">
                                No agents found. Use a template above to get started.
                            </td>
                        </tr>
                    ) : (
                        agents.map((agent) => (
                            <tr
                                key={agent.id}
                                className="group hover:bg-sidebar-hover/20 transition-colors cursor-pointer"
                                onClick={() => onSelectAgent?.(agent)}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${agent.enabled ? "bg-primary-500/10 text-primary-400" : "bg-sidebar-hover/50 text-muted"
                                            }`}>
                                            {agent.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-surface-200 group-hover:text-primary-400 transition-colors">
                                            {agent.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-muted">
                                    Default Workspace
                                </td>
                                <td className="p-4 text-muted font-mono text-xs">
                                    {agent.lastRunAt ? format(new Date(agent.lastRunAt), "MMM d, HH:mm") : "Never"}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onToggleStatus(agent.id, !agent.enabled); }}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${agent.enabled
                                            ? "bg-primary-500/10 text-primary-400 hover:bg-primary-500/20"
                                            : "bg-sidebar-hover/50 text-muted hover:bg-sidebar-hover"
                                            }`}
                                    >
                                        {agent.enabled ? (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-surface-500" />
                                                Inactive
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/agents/${agent.id}`} onClick={(e) => e.stopPropagation()}>
                                            <button className="p-2 hover:bg-sidebar-hover rounded-lg text-muted hover:text-white transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(agent.id); }}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-400 transition-colors"
                                            title="Delete"
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

