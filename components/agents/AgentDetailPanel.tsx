"use client";

import { useState, useEffect } from "react";
import { X, Settings, Zap, Clock, Activity, ExternalLink } from "lucide-react";
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
    agent: Agent;
    onClose: () => void;
}

type TabType = "general" | "tools" | "triggers" | "results";

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "tools", label: "Tools", icon: Zap },
    { id: "triggers", label: "Triggers", icon: Clock },
    { id: "results", label: "Run results", icon: Activity },
];

export default function AgentDetailPanel({ agent, onClose }: AgentDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>("general");

    // ESC キーで閉じる
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <>
            {/* オーバーレイ */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* スライドパネル */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            agent.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
                        )}>
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
                            <p className="text-sm text-slate-400">{agent.type}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* タブナビゲーション */}
                <div className="flex border-b border-slate-700">
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
                                        ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5"
                                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                )}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* タブコンテンツ */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "general" && <GeneralTab agent={agent} />}
                    {activeTab === "tools" && <ToolsTab agentId={agent.id} />}
                    {activeTab === "triggers" && <TriggersTab agentId={agent.id} />}
                    {activeTab === "results" && <RunResultsTab agentId={agent.id} />}
                </div>
            </div>
        </>
    );
}
