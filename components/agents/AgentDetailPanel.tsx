"use client";

import { useState, useEffect } from "react";
import { Settings, Zap, Clock, Activity, Loader2 } from "lucide-react";
import clsx from "clsx";
import GeneralTab from "./tabs/GeneralTab";
import ToolsTab from "./tabs/ToolsTab";
import TriggersTab from "./tabs/TriggersTab";
import RunResultsTab from "./tabs/RunResultsTab";

interface Agent {
    id: string;
    name: string;
    type: string;
    description: string | null;
    enabled: boolean;
    keyCapabilities: string | null;
    recommendedUses: string | null;
}

interface AgentDetailPanelProps {
    agentId: string;
}

type TabType = "general" | "tools" | "triggers" | "results";

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "tools", label: "Tools", icon: Zap },
    { id: "triggers", label: "Triggers", icon: Clock },
    { id: "results", label: "Run results", icon: Activity },
];

export default function AgentDetailPanel({ agentId }: AgentDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgent = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/agents/${agentId}`);
                const { data } = await res.json();
                setAgent(data);
            } catch (error) {
                console.error("Failed to fetch agent:", error);
            }
            setLoading(false);
        };
        fetchAgent();
    }, [agentId]);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-surface-500">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Loading agent details...</span>
                </div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="h-64 flex items-center justify-center text-surface-500">
                Agent not found.
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {/* タブナビゲーション */}
            <div className="flex border-b border-sidebar-hover rounded-t-xl overflow-hidden bg-sidebar/30">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "text-primary-400 border-b-2 border-primary-400 bg-primary-500/5"
                                    : "text-muted hover:text-white hover:bg-sidebar-hover/50"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* タブコンテンツ */}
            <div className="pt-6">
                {activeTab === "general" && <GeneralTab agent={agent} />}
                {activeTab === "tools" && <ToolsTab agentId={agent.id} />}
                {activeTab === "triggers" && <TriggersTab agentId={agent.id} />}
                {activeTab === "results" && <RunResultsTab agentId={agent.id} />}
            </div>
        </div>
    );
}
