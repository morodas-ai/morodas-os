"use client";

import { useState, useEffect } from "react";
import { User, Globe, Check, Brain, Bot, Bell, Palette, Wifi, WifiOff } from "lucide-react";

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
        checkEndpoint: null,
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

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        color: "var(--text)",
        fontFamily: "inherit",
        fontSize: 14,
        outline: "none",
    };

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        appearance: "none" as const,
        WebkitAppearance: "none" as const,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238D7B6E' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
    };

    return (
        <div style={{ maxWidth: 800 }}>
            <h1 className="section-header" style={{ marginBottom: 32 }}>⚙️ 設定</h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* プロフィール */}
                <section className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: 10, color: "var(--primary)" }}>
                            <User size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>プロフィール設定</h2>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>アカウント情報を管理</p>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>名前</label>
                            <input
                                type="text"
                                value={settings.user_name || ""}
                                onChange={(e) => setSettings({ ...settings, user_name: e.target.value })}
                                onBlur={(e) => saveSetting("user_name", e.target.value)}
                                style={inputStyle}
                                placeholder="あなたの名前"
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6 }}>メールアドレス</label>
                            <input
                                type="email"
                                value={settings.user_email || ""}
                                onChange={(e) => setSettings({ ...settings, user_email: e.target.value })}
                                onBlur={(e) => saveSetting("user_email", e.target.value)}
                                style={inputStyle}
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>
                </section>

                {/* MORODAS設定 */}
                <section className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: 10, color: "var(--primary)" }}>
                            <Globe size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>MORODAS設定</h2>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>システム全体の設定</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div>
                            <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>停滞検知の閾値（日数）</span>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>この日数を超えるとアラート</p>
                        </div>
                        <input
                            type="number"
                            value={settings.stagnation_threshold_days || "2"}
                            onChange={(e) => saveSetting("stagnation_threshold_days", e.target.value)}
                            style={{ ...inputStyle, width: 72, textAlign: "center" }}
                        />
                    </div>
                </section>

                {/* AI設定 */}
                <section className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: 10, color: "var(--primary)" }}>
                            <Bot size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>AI設定</h2>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>コンテンツ生成・AIアシスタントの設定</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>AIモデル</label>
                            <select
                                value={settings.ai_model || "flash"}
                                onChange={(e) => saveSetting("ai_model", e.target.value)}
                                style={selectStyle}
                            >
                                <option value="flash">Gemini 2.0 Flash（高速・低コスト）</option>
                                <option value="pro-25">Gemini 2.5 Pro（高品質）</option>
                                <option value="pro-30">Gemini 3.0 Pro（最高品質）</option>
                            </select>
                        </div>
                        <div style={{ padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>記事のトーン</label>
                            <select
                                value={settings.ai_tone || "professional"}
                                onChange={(e) => saveSetting("ai_tone", e.target.value)}
                                style={selectStyle}
                            >
                                <option value="professional">プロフェッショナル</option>
                                <option value="casual">カジュアル・親しみやすい</option>
                                <option value="technical">テクニカル・専門的</option>
                                <option value="storytelling">ストーリーテリング</option>
                            </select>
                        </div>
                        <div style={{ padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>ブランドボイス</label>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>AIが記事やSNS投稿を書くときに参照するトーン指示</p>
                            <textarea
                                value={settings.brand_voice || ""}
                                onChange={(e) => setSettings({ ...settings, brand_voice: e.target.value })}
                                onBlur={(e) => saveSetting("brand_voice", e.target.value)}
                                rows={3}
                                className="design-textarea"
                                placeholder={'例: 「専門的だけど堅すぎない。具体例を多用して読者の行動を促す。AIの可能性に前向き。」'}
                            />
                        </div>
                    </div>
                </section>

                {/* 通知設定 */}
                <section className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: 10, color: "var(--primary)" }}>
                            <Bell size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>通知設定</h2>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>タスク完了やアラートの通知先</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Discord Webhook URL</label>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>エージェント完了通知やアラートをDiscordに送信</p>
                            <input
                                type="url"
                                value={settings.discord_webhook_url || ""}
                                onChange={(e) => setSettings({ ...settings, discord_webhook_url: e.target.value })}
                                onBlur={(e) => saveSetting("discord_webhook_url", e.target.value)}
                                style={inputStyle}
                                placeholder="https://discord.com/api/webhooks/..."
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <div>
                                <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>メール通知</span>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>重要なアラートをメールで受信</p>
                            </div>
                            <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 9999, background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                                Coming Soon
                            </span>
                        </div>
                    </div>
                </section>

                {/* 接続サービス */}
                <section className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: 10, color: "var(--primary)" }}>
                            <Palette size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>接続サービス</h2>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>現在接続されている外部サービス</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {realIntegrations.map((service) => {
                            const isN8n = service.name === "n8n";
                            const status = isN8n ? n8nStatus : "connected";
                            const StatusIcon = status === "connected" ? Wifi : status === "error" ? WifiOff : Wifi;
                            const statusText = status === "connected" ? "接続済み" : status === "error" ? "接続エラー" : "確認中...";

                            return (
                                <div key={service.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <StatusIcon size={18} style={{ color: status === "connected" ? "var(--success)" : status === "error" ? "var(--error)" : "var(--warning)" }} />
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{service.name}</span>
                                                <span className={status === "connected" ? "badge-done" : status === "error" ? "badge-alert" : "badge-processing"}>
                                                    {statusText}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{service.description}</p>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{service.category}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 16, padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px dashed var(--border)", textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            🔜 <strong style={{ color: "var(--text)" }}>X/Twitter, Discord Bot</strong> の直接連携を追加予定
                        </p>
                    </div>
                </section>

                {/* ナレッジベース */}
                <section className="card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ background: "var(--bg-surface)", padding: 12, borderRadius: 10, color: "var(--primary)" }}>
                            <Brain size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>ナレッジベース</h2>
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>エージェントの学習データ</p>
                        </div>
                    </div>
                    <div style={{ padding: 14, background: "var(--bg-surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <p style={{ fontSize: 14, color: "var(--text)" }}>Obsidian Vault（Vertex AI Search経由）</p>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>500+ ファイルがRAG検索に利用可能</p>
                            </div>
                            <span className="badge-done">稼働中</span>
                        </div>
                    </div>
                </section>

                {saved && (
                    <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--primary)", color: "white", padding: "10px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, boxShadow: "var(--shadow)", fontSize: 14, fontWeight: 600 }}>
                        <Check size={16} /> 保存しました
                    </div>
                )}
            </div>
        </div>
    );
}
