"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Zap, Database, Activity, Save, Check } from "lucide-react";
import clsx from "clsx";
import type { Agent } from "@/types";

export default function AgentEditorClient({ agent }: { agent: Agent }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("general");
    const [formData, setFormData] = useState({
        name: agent.name,
        type: agent.type,
        description: agent.description || "",
        enabled: agent.enabled,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const tabs = [
        { id: "general", label: "基本設定", icon: Settings },
        { id: "tools", label: "ツール", icon: Database },
        { id: "triggers", label: "トリガー", icon: Zap },
        { id: "runs", label: "実行履歴", icon: Activity },
    ];

    const saveAgent = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/agents/${agent.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save agent:", error);
        }
        setIsSaving(false);
    };

    return (
        <div className="bg-sidebar rounded-xl border border-sidebar-hover overflow-hidden">
            <div className="flex border-b border-sidebar-hover">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2",
                                activeTab === tab.id
                                    ? "border-primary-500 text-primary-500 bg-primary-500/5"
                                    : "border-transparent text-muted hover:text-surface-200 hover:bg-sidebar-hover/50"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="p-6 min-h-[400px]">
                {activeTab === "general" && (
                    <div className="max-w-xl space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">エージェント名</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-2 text-surface-50 focus:outline-none focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">タイプ</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-2 text-surface-50 focus:outline-none focus:border-primary-500"
                            >
                                <option value="news">News Agent</option>
                                <option value="seo">SEO Agent</option>
                                <option value="social">Social Agent</option>
                                <option value="geo">GEO Agent</option>
                                <option value="growth">Growth Agent</option>
                                <option value="competitor">Competitor Agent</option>
                                <option value="socialmedia">Social Media Agent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">説明</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-2 text-surface-50 focus:outline-none focus:border-primary-500"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="enabled"
                                checked={formData.enabled}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                className="rounded border-sidebar-hover bg-sidebar"
                            />
                            <label htmlFor="enabled" className="text-surface-300">有効にする</label>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <button
                                onClick={saveAgent}
                                disabled={isSaving}
                                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {saved ? <Check size={16} /> : <Save size={16} />}
                                {saved ? "保存しました" : "保存"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "tools" && (
                    <div className="space-y-4">
                        <p className="text-muted mb-4">このエージェントがアクセスできるツールを選択してください。</p>
                        {["Google Search", "Twitter API", "OpenAI", "Slack", "YouTube", "Gmail"].map((tool) => (
                            <div key={tool} className="flex items-center justify-between p-4 bg-foreground rounded-lg border border-sidebar-hover">
                                <span className="font-medium text-surface-50">{tool}</span>
                                <div className="w-12 h-6 bg-primary-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "triggers" && (
                    <div className="space-y-4">
                        <div className="p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <h4 className="font-medium text-surface-50 mb-2">スケジュール</h4>
                            <div className="flex gap-4 mb-2">
                                <select className="bg-sidebar border border-sidebar-hover rounded px-3 py-2 text-surface-300">
                                    <option>毎日</option>
                                    <option>毎週</option>
                                </select>
                                <select className="bg-sidebar border border-sidebar-hover rounded px-3 py-2 text-surface-300">
                                    <option>09:00</option>
                                    <option>10:00</option>
                                    <option>12:00</option>
                                    <option>18:00</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <h4 className="font-medium text-surface-50 mb-2">イベントトリガー</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-surface-300">
                                    <input type="checkbox" className="rounded border-sidebar-hover bg-sidebar" />
                                    メール受信時 (Gmail)
                                </label>
                                <label className="flex items-center gap-2 text-surface-300">
                                    <input type="checkbox" className="rounded border-sidebar-hover bg-sidebar" />
                                    Xでメンション時
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "runs" && (
                    <div className="text-center text-surface-500 py-12">
                        実行履歴はフィードで確認できます。
                    </div>
                )}
            </div>
        </div>
    );
}
