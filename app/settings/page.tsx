"use client";

import { useState, useEffect } from "react";
import { User, Globe, Check, Brain, Bot, Bell, Palette, ExternalLink, Wifi, WifiOff } from "lucide-react";

interface Settings {
    user_name?: string;
    user_email?: string;
    stagnation_threshold_days?: string;
    ai_model?: string;
    ai_tone?: string;
    brand_voice?: string;
    discord_webhook_url?: string;
    notify_email?: string;
    notify_discord?: string;
}

// 実際に動いている連携サービス（ガワだけは表示しない）
const realIntegrations = [
    {
        name: "n8n",
        description: "ワークフロー自動化エンジン",
        category: "オートメーション",
        checkEndpoint: "/api/n8n",
        configHint: "環境変数 N8N_API_KEY で設定済み",
    },
    {
        name: "Gemini API",
        description: "AI推論（チャット・記事生成・ブリーフィング）",
        category: "AI",
        checkEndpoint: null, // 環境変数で管理
        configHint: "環境変数 GEMINI_API_KEY で設定済み",
    },
    {
        name: "Vertex AI Search",
        description: "ナレッジベースRAG検索",
        category: "AI",
        checkEndpoint: null,
        configHint: "環境変数 GOOGLE_CLOUD_PROJECT で設定済み",
    },
    {
        name: "PostgreSQL",
        description: "データベース（Neon）",
        category: "インフラ",
        checkEndpoint: null,
        configHint: "環境変数 POSTGRES_URL で設定済み",
    },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [n8nStatus, setN8nStatus] = useState<"checking" | "connected" | "error">("checking");

    useEffect(() => {
        fetch("/api/settings")
            .then((res) => res.json())
            .then(({ data }) => setSettings(data || {}))
            .catch(console.error);

        // n8n接続チェック
        fetch("/api/n8n")
            .then((res) => {
                setN8nStatus(res.ok ? "connected" : "error");
            })
            .catch(() => setN8nStatus("error"));
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
                                placeholder="あなたの名前"
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
                                placeholder="email@example.com"
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

                {/* AI設定 */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">AI設定</h2>
                            <p className="text-muted text-sm">コンテンツ生成・AIアシスタントの設定</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <label className="block text-sm font-medium text-surface-50 mb-2">AIモデル</label>
                            <select
                                value={settings.ai_model || "flash"}
                                onChange={(e) => saveSetting("ai_model", e.target.value)}
                                className="w-full bg-sidebar border border-sidebar-hover rounded-lg px-4 py-2 text-surface-300 focus:outline-none focus:border-primary-500"
                            >
                                <option value="flash">Gemini 2.0 Flash（高速・低コスト）</option>
                                <option value="pro-25">Gemini 2.5 Pro（高品質）</option>
                                <option value="pro-30">Gemini 3.0 Pro（最高品質）</option>
                            </select>
                        </div>
                        <div className="p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <label className="block text-sm font-medium text-surface-50 mb-2">記事のトーン</label>
                            <select
                                value={settings.ai_tone || "professional"}
                                onChange={(e) => saveSetting("ai_tone", e.target.value)}
                                className="w-full bg-sidebar border border-sidebar-hover rounded-lg px-4 py-2 text-surface-300 focus:outline-none focus:border-primary-500"
                            >
                                <option value="professional">プロフェッショナル</option>
                                <option value="casual">カジュアル・親しみやすい</option>
                                <option value="technical">テクニカル・専門的</option>
                                <option value="storytelling">ストーリーテリング</option>
                            </select>
                        </div>
                        <div className="p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <label className="block text-sm font-medium text-surface-50 mb-2">ブランドボイス</label>
                            <p className="text-xs text-muted mb-2">AIが記事やSNS投稿を書くときに参照するトーン指示</p>
                            <textarea
                                value={settings.brand_voice || ""}
                                onChange={(e) => setSettings({ ...settings, brand_voice: e.target.value })}
                                onBlur={(e) => saveSetting("brand_voice", e.target.value)}
                                rows={3}
                                className="w-full bg-sidebar border border-sidebar-hover rounded-lg px-4 py-2 text-surface-300 focus:outline-none focus:border-primary-500 resize-none"
                                placeholder="例: 「専門的だけど堅すぎない。具体例を多用して読者の行動を促す。AIの可能性に前向き。」"
                            />
                        </div>
                    </div>
                </section>

                {/* 通知設定 */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">通知設定</h2>
                            <p className="text-muted text-sm">タスク完了やアラートの通知先</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <label className="block text-sm font-medium text-surface-50 mb-2">Discord Webhook URL</label>
                            <p className="text-xs text-muted mb-2">エージェント完了通知やアラートをDiscordに送信</p>
                            <input
                                type="url"
                                value={settings.discord_webhook_url || ""}
                                onChange={(e) => setSettings({ ...settings, discord_webhook_url: e.target.value })}
                                onBlur={(e) => saveSetting("discord_webhook_url", e.target.value)}
                                className="w-full bg-sidebar border border-sidebar-hover rounded-lg px-4 py-2 text-surface-300 focus:outline-none focus:border-primary-500"
                                placeholder="https://discord.com/api/webhooks/..."
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-foreground rounded-lg border border-sidebar-hover">
                            <div>
                                <span className="font-medium text-surface-50">メール通知</span>
                                <p className="text-xs text-muted">重要なアラートをメールで受信</p>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-sidebar-hover text-muted">
                                Coming Soon
                            </span>
                        </div>
                    </div>
                </section>

                {/* 接続サービス（実際に動いているもののみ） */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">接続サービス</h2>
                            <p className="text-muted text-sm">現在接続されている外部サービス</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {realIntegrations.map((service) => {
                            const isN8n = service.name === "n8n";
                            const status = isN8n ? n8nStatus : "connected";
                            const StatusIcon = status === "connected" ? Wifi : status === "error" ? WifiOff : Wifi;
                            const statusText = status === "connected" ? "接続済み" : status === "error" ? "接続エラー" : "確認中...";
                            const statusColor = status === "connected"
                                ? "bg-primary-500/10 text-primary-500"
                                : status === "error"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-yellow-500/10 text-yellow-400";

                            return (
                                <div key={service.name} className="flex items-center justify-between p-4 bg-foreground rounded-lg border border-sidebar-hover">
                                    <div className="flex items-center gap-4">
                                        <StatusIcon size={18} className={status === "connected" ? "text-primary-500" : status === "error" ? "text-red-400" : "text-yellow-400"} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-surface-50">{service.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted mt-0.5">{service.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-surface-400 hidden md:block">{service.category}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 今後追加予定 */}
                    <div className="mt-6 p-4 bg-foreground rounded-lg border border-dashed border-sidebar-hover">
                        <p className="text-sm text-muted text-center">
                            🔜 <strong className="text-surface-300">X/Twitter, Discord Bot</strong> の直接連携を追加予定
                        </p>
                    </div>
                </section>

                {/* ナレッジベース */}
                <section className="bg-sidebar rounded-xl p-6 border border-sidebar-hover">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-sidebar-hover p-3 rounded-lg text-primary-500">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-surface-50">ナレッジベース</h2>
                            <p className="text-muted text-sm">エージェントの学習データ</p>
                        </div>
                    </div>
                    <div className="p-4 bg-foreground rounded-lg border border-sidebar-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-surface-300">Obsidian Vault（Vertex AI Search経由）</p>
                                <p className="text-xs text-muted mt-1">500+ ファイルがRAG検索に利用可能</p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
                                稼働中
                            </span>
                        </div>
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
