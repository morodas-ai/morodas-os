"use client";

import { useState, useEffect } from "react";
import { User, Key, Globe, Check, Brain } from "lucide-react";

interface Settings {
    user_name?: string;
    user_email?: string;
    stagnation_threshold_days?: string;
}

// 連携サービス定義（NoimosAI参考：15個をカテゴリ別に整理）
const integrationCategories = [
    {
        category: "SNS",
        services: [
            { name: "Twitter / X", status: "未接続" },
            { name: "Instagram", status: "未接続" },
            { name: "LinkedIn", status: "未接続" },
            { name: "Facebook", status: "未接続" },
        ]
    },
    {
        category: "コミュニケーション",
        services: [
            { name: "Slack", status: "未接続" },
            { name: "Discord", status: "未接続" },
        ]
    },
    {
        category: "オートメーション",
        services: [
            { name: "n8n", status: "接続済み" },
            { name: "Zapier", status: "未接続" },
        ]
    },
    {
        category: "生産性ツール",
        services: [
            { name: "Google Workspace", status: "未接続" },
            { name: "Notion", status: "未接続" },
            { name: "Calendly", status: "未接続" },
        ]
    },
    {
        category: "CRM / 営業",
        services: [
            { name: "HubSpot", status: "未接続" },
            { name: "Salesforce", status: "未接続" },
        ]
    },
    {
        category: "AI / データ",
        services: [
            { name: "OpenAI / Gemini", status: "接続済み" },
            { name: "Tavily (検索)", status: "接続済み" },
        ]
    },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/settings")
            .then((res) => res.json())
            .then(({ data }) => setSettings(data || {}))
            .catch(console.error);
    }, []);

    const saveSetting = async (key: string, value: string) => {
        setIsSaving(true);
        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value }),
            });
            setSettings({ ...settings, [key]: value });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save setting:", error);
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-surface-50">設定</h1>

            <div className="space-y-8">
                {/* プロフィール */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">プロフィール設定</h2>
                            <p className="text-muted text-sm">アカウント情報を管理</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">名前</label>
                            <input
                                type="text"
                                value={settings.user_name || ""}
                                onChange={(e) => setSettings({ ...settings, user_name: e.target.value })}
                                onBlur={(e) => saveSetting("user_name", e.target.value)}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-2 text-surface-50 focus:outline-none focus:border-primary-500"
                                placeholder="オジキ"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">メールアドレス</label>
                            <input
                                type="email"
                                value={settings.user_email || ""}
                                onChange={(e) => setSettings({ ...settings, user_email: e.target.value })}
                                onBlur={(e) => saveSetting("user_email", e.target.value)}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-2 text-surface-50 focus:outline-none focus:border-primary-500"
                                placeholder="ojiki@example.com"
                            />
                        </div>
                    </div>
                </section>

                {/* MORODAS設定 */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <Globe size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">MORODAS設定</h2>
                            <p className="text-muted text-sm">システム全体の設定</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <div>
                                <span className="font-medium text-surface-50">停滞検知の閾値（日数）</span>
                                <p className="text-xs text-muted">この日数を超えるとアラート</p>
                            </div>
                            <input
                                type="number"
                                value={settings.stagnation_threshold_days || "2"}
                                onChange={(e) => saveSetting("stagnation_threshold_days", e.target.value)}
                                className="bg-sidebar border border-sidebar-hover rounded px-3 py-2 text-surface-300 w-20"
                            />
                        </div>
                    </div>
                </section>

                {/* 連携サービス（拡充版：15個、カテゴリ別） */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <Key size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">連携サービス</h2>
                            <p className="text-muted text-sm">外部サービスの接続（15アプリ対応）</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {integrationCategories.map((cat) => (
                            <div key={cat.category}>
                                <h3 className="text-sm font-semibold text-primary-400 mb-3 uppercase tracking-wide">{cat.category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {cat.services.map((service) => (
                                        <div key={service.name} className="flex items-center justify-between p-3 bg-foreground rounded-lg border border-sidebar-hover">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-surface-50 text-sm">{service.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${service.status === "接続済み" ? "bg-primary-500/10 text-primary-500" : "bg-sidebar-hover text-muted"}`}>
                                                    {service.status}
                                                </span>
                                            </div>
                                            <button className="text-xs bg-sidebar hover:bg-sidebar-hover border border-foreground px-2 py-1 rounded text-surface-300 transition-colors">
                                                {service.status === "接続済み" ? "管理" : "接続"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ナレッジベース（新規） */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">ナレッジベース</h2>
                            <p className="text-muted text-sm">エージェントの学習データ（Coming Soon）</p>
                        </div>
                    </div>
                    <div className="p-4 bg-foreground rounded-lg border border-dashed border-foreground text-center">
                        <p className="text-muted text-sm">ドキュメントやデータをアップロードして、エージェントをカスタマイズ</p>
                        <button className="mt-3 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg text-sm hover:bg-primary-500/30 transition-colors">
                            近日公開
                        </button>
                    </div>
                </section>

                {saved && (
                    <div className="fixed bottom-6 right-6 bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                        <Check size={16} /> 保存しました
                    </div>
                )}
            </div>
        </div>
    );
}
