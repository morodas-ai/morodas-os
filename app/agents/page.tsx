"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import TemplateGallery from "@/components/agents/TemplateGallery";
import AgentListTable from "@/components/agents/AgentListTable";
import AgentFilters from "@/components/agents/AgentFilters";
import AgentCreationModal from "@/components/agents/AgentCreationModal";
import AgentDetailPanel from "@/components/agents/AgentDetailPanel";
import type { Agent } from "@/types";

export default function AgentsPage() {
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
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      await fetch(`/api/agents/${id}`, { method: "DELETE" });
      setAgents(agents.filter((a) => a.id !== id));
      if (selectedAgent?.id === id) setSelectedAgent(null);
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  return (
    <div className="min-h-screen bg-foreground text-surface-50 p-6 md:p-8 space-y-10 max-w-[1600px] mx-auto">

      {/* Header & Templates Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-400 bg-clip-text text-transparent">
              おすすめテンプレート
            </h1>
            <p className="text-muted mt-2">
              よく使うユースケースのショートカット
            </p>
          </div>
        </div>

        {/* Horizontal Scroll Template Gallery */}
        <TemplateGallery />
      </section>

      {/* Agents List Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-sidebar pb-6">
          <div>
            <h2 className="text-2xl font-bold text-surface-100">エージェント</h2>
            <p className="text-muted mt-1">
              AIエージェントの管理と活動状況の確認
            </p>
          </div>
          <button
            onClick={() => setShowCreationModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-400 text-foreground font-bold rounded-lg transition-all shadow-lg hover:shadow-primary-500/20"
          >
            <Plus size={20} />
            <span>新規作成</span>
          </button>
        </div>

        {/* Filters & Table */}
        <div>
          <AgentFilters />

          {loading ? (
            <div className="h-64 flex items-center justify-center border border-sidebar rounded-xl bg-foreground/30">
              <div className="flex flex-col items-center gap-3 text-surface-500">
                <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                読み込み中...
              </div>
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
      </section>

      {/* Agent Detail Panel (slide-out) */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[80] flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedAgent(null)}
          />
          <div className="relative w-full max-w-2xl bg-foreground border-l border-sidebar-hover shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-foreground/95 backdrop-blur border-b border-sidebar">
              <h2 className="text-lg font-bold text-white">{selectedAgent.name}</h2>
              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 text-muted hover:text-white hover:bg-sidebar-hover rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
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
