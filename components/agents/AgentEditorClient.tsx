"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Zap, Database, Activity, Save, Check } from "lucide-react";
import clsx from "clsx";

interface Agent {
    id: string;
    name: string;
    type: string;
    description: string | null;
    config: string;
    enabled: boolean;
}

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
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="flex border-b border-slate-700">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2",
                                activeTab === tab.id
                                    ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
                                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">エージェント名</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">タイプ</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-emerald-500"
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">説明</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="enabled"
                                checked={formData.enabled}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                className="rounded border-slate-700 bg-slate-800"
                            />
                            <label htmlFor="enabled" className="text-slate-300">有効にする</label>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <button
                                onClick={saveAgent}
                                disabled={isSaving}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {saved ? <Check size={16} /> : <Save size={16} />}
                                {saved ? "保存しました" : "保存"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "tools" && (
                    <div className="space-y-4">
                        <p className="text-slate-400 mb-4">このエージェントがアクセスできるツールを選択してください。</p>
                        {["Google Search", "Twitter API", "OpenAI", "Slack", "YouTube", "Gmail"].map((tool) => (
                            <div key={tool} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                                <span className="font-medium text-slate-50">{tool}</span>
                                <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "triggers" && (
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                            <h4 className="font-medium text-slate-50 mb-2">スケジュール</h4>
                            <div className="flex gap-4 mb-2">
                                <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-300">
                                    <option>毎日</option>
                                    <option>毎週</option>
                                </select>
                                <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-300">
                                    <option>09:00</option>
                                    <option>10:00</option>
                                    <option>12:00</option>
                                    <option>18:00</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                            <h4 className="font-medium text-slate-50 mb-2">イベントトリガー</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-slate-300">
                                    <input type="checkbox" className="rounded border-slate-700 bg-slate-800" />
                                    メール受信時 (Gmail)
                                </label>
                                <label className="flex items-center gap-2 text-slate-300">
                                    <input type="checkbox" className="rounded border-slate-700 bg-slate-800" />
                                    Xでメンション時
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "runs" && (
                    <div className="text-center text-slate-500 py-12">
                        実行履歴はフィードで確認できます。
                    </div>
                )}
            </div>
        </div>
    );
}
