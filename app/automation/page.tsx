"use client";

import { useState, useEffect } from "react";
import { Plus, X, Zap, Loader2 } from "lucide-react";
import TemplateGallery from "@/components/agents/TemplateGallery";
import AgentListTable from "@/components/agents/AgentListTable";
import AgentFilters from "@/components/agents/AgentFilters";
import AgentCreationModal from "@/components/agents/AgentCreationModal";
import AgentDetailPanel from "@/components/agents/AgentDetailPanel";
import type { Agent } from "@/types";

export default function AutomationPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

    const fetchAgents = async () => {
        try {
            const res = await fetch("/api/agents");
            const { data } = await res.json();
            setAgents(
                data.map((a: any) => ({
                    ...a,
                    lastRunAt: a.lastRunAt || null,
                }))
            );
        } catch (error) {
            console.error("Failed to fetch agents:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleToggleStatus = async (id: string, currentEnabled: boolean) => {
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

    const handleDelete = async (id: string) => {
        if (!confirm("この自動化を削除してもよろしいですか？")) return;
        try {
            await fetch(`/api/agents/${id}`, { method: "DELETE" });
            setAgents(agents.filter((a) => a.id !== id));
            if (selectedAgent?.id === id) setSelectedAgent(null);
        } catch (error) {
            console.error("Failed to delete agent:", error);
        }
    };

    return (
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            {/* Header & Templates Section */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div>
                        <h1 className="section-header" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Zap size={26} style={{ color: "var(--primary)" }} />
                            自動化
                        </h1>
                        <p className="section-subheader">テンプレートを選んで「はじめる」だけ。あとはAIが自動で実行します。</p>
                    </div>
                </div>

                <TemplateGallery />
            </div>

            {/* Agents List Section */}
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>実行中の自動化</h2>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>自動化タスクの管理と実行状況</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14 }} onClick={() => setShowCreationModal(true)}>
                        <Plus size={18} />
                        新しく作る
                    </button>
                </div>

                <AgentFilters />

                {loading ? (
                    <div className="flex-center" style={{ padding: 80 }}>
                        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
                    </div>
                ) : (
                    <AgentListTable
                        agents={agents}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                        onSelectAgent={(agent) => setSelectedAgent(agent)}
                    />
                )}
            </div>

            {/* Agent Detail Panel (slide-out) */}
            {selectedAgent && (
                <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", justifyContent: "flex-end" }}>
                    <div
                        style={{ position: "absolute", inset: 0, background: "rgba(62, 44, 35, 0.4)", backdropFilter: "blur(4px)" }}
                        onClick={() => setSelectedAgent(null)}
                    />
                    <div style={{ position: "relative", width: "100%", maxWidth: 640, background: "var(--color-surface-50)", borderLeft: "1px solid var(--border)", overflowY: "auto" }}>
                        <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: "var(--color-surface-50)", borderBottom: "1px solid var(--border)" }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{selectedAgent.name}</h2>
                            <button
                                onClick={() => setSelectedAgent(null)}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--text-muted)" }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <AgentDetailPanel agentId={selectedAgent.id} />
                        </div>
                    </div>
                </div>
            )}

            {/* Agent Creation Modal */}
            <AgentCreationModal
                isOpen={showCreationModal}
                onClose={() => {
                    setShowCreationModal(false);
                    fetchAgents();
                }}
            />
        </div>
    );
}
