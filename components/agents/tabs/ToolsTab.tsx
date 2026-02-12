"use client";

import { useState, useEffect } from "react";
import {
    Twitter,
    FolderOpen,
    MessageSquare,
    Youtube,
    Search,
    FileText,
    Facebook,
    Loader2,
    Check,
    Plus,
    X
} from "lucide-react";
import clsx from "clsx";

interface Tool {
    id: string;
    name: string;
    provider: string;
    icon: string | null;
    description: string | null;
    isConnected?: boolean;
}

interface AgentTool {
    id: string;
    toolId: string;
    isConnected: boolean;
    tool: Tool;
}

interface ToolsTabProps {
    agentId: string;
}

// アイコンマッピング
const iconMap: Record<string, React.ElementType> = {
    Twitter: Twitter,
    FolderOpen: FolderOpen,
    MessageSquare: MessageSquare,
    Youtube: Youtube,
    Search: Search,
    FileText: FileText,
    Facebook: Facebook,
};

export default function ToolsTab({ agentId }: ToolsTabProps) {
    const [tools, setTools] = useState<Tool[]>([]);
    const [agentTools, setAgentTools] = useState<AgentTool[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [agentId]);

    const fetchData = async () => {
        try {
            // 全ツールを取得
            const toolsRes = await fetch("/api/tools");
            const toolsData = await toolsRes.json();
            setTools(toolsData.data || []);

            // エージェントのツール連携を取得
            const agentToolsRes = await fetch(`/api/agents/${agentId}/tools`);
            const agentToolsData = await agentToolsRes.json();
            setAgentTools(agentToolsData.data || []);
        } catch (error) {
            console.error("Failed to fetch tools:", error);
        }
        setLoading(false);
    };

    const toggleConnection = async (toolId: string) => {
        setToggling(toolId);
        try {
            const existing = agentTools.find(at => at.toolId === toolId);

            if (existing) {
                // トグル: 連携状態を切り替え
                const res = await fetch(`/api/agents/${agentId}/tools`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ toolId, isConnected: !existing.isConnected }),
                });
                if (res.ok) {
                    setAgentTools(prev =>
                        prev.map(at =>
                            at.toolId === toolId ? { ...at, isConnected: !at.isConnected } : at
                        )
                    );
                }
            } else {
                // 新規連携
                const res = await fetch(`/api/agents/${agentId}/tools`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ toolId }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setAgentTools(prev => [...prev, data.data]);
                }
            }
        } catch (error) {
            console.error("Failed to toggle connection:", error);
        }
        setToggling(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary-400" size={24} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted mb-4">
                このエージェントが使用できるツール・プロバイダーを管理します。
            </p>

            <div className="space-y-3">
                {tools.map((tool) => {
                    const IconComponent = iconMap[tool.icon || ""] || Search;
                    const agentTool = agentTools.find(at => at.toolId === tool.id);
                    const isConnected = agentTool?.isConnected || false;
                    const isToggling = toggling === tool.id;

                    return (
                        <div
                            key={tool.id}
                            className={clsx(
                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                isConnected
                                    ? "bg-primary-500/10 border-primary-500/30"
                                    : "bg-sidebar-hover/50 border-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    isConnected ? "bg-primary-500/20 text-primary-400" : "bg-foreground text-surface-300"
                                )}>
                                    <IconComponent size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{tool.name}</h4>
                                    <p className="text-sm text-muted">{tool.description}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleConnection(tool.id)}
                                disabled={isToggling}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    isConnected
                                        ? "bg-primary-500 text-white hover:bg-primary-600"
                                        : "bg-foreground text-white hover:bg-surface-500",
                                    isToggling && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isToggling ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : isConnected ? (
                                    <>
                                        <Check size={16} />
                                        Connected
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Connect
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {tools.length === 0 && (
                <div className="text-center py-8 text-muted">
                    利用可能なツールがありません
                </div>
            )}
        </div>
    );
}
