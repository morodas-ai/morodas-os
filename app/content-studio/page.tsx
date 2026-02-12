"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Clock,
    Eye,
    Loader2,
    FileText,
    Send,
    Sparkles,
    ArrowRight,
    Globe,
    Rocket,
    RotateCcw,
    X,
} from "lucide-react";

interface ContentItem {
    id: string;
    title: string;
    status: string;
    source?: string;
    score?: number;
    angle?: string;
    keywords?: string;
    articleBody?: string;
    wpPostUrl?: string;
    createdAt: string;
    updatedAt: string;
}

const statusFlow: Record<string, { label: string; badgeClass: string }> = {
    candidate: { label: "候補", badgeClass: "badge-review" },
    generating: { label: "生成中…", badgeClass: "badge-processing" },
    draft: { label: "レビュー待ち", badgeClass: "badge-review" },
    publishing: { label: "公開中…", badgeClass: "badge-processing" },
    published: { label: "公開済み ✨", badgeClass: "badge-done" },
    rejected: { label: "不採用", badgeClass: "badge-alert" },
};

function getStatus(status: string) {
    return statusFlow[status] || statusFlow.candidate;
}

export default function ContentStudioPage() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTheme, setNewTheme] = useState("");
    const [newAngle, setNewAngle] = useState("");
    const [newKeywords, setNewKeywords] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
        const interval = setInterval(fetchItems, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch("/api/content-studio");
            const { data } = await res.json();
            setItems(data || []);
        } catch (error) {
            console.error("Failed to fetch content:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const createArticle = async () => {
        if (!newTheme.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch("/api/content-studio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTheme,
                    angle: newAngle || undefined,
                    keywords: newKeywords || undefined,
                }),
            });
            const { data } = await res.json();
            await fetch(`/api/content-studio/${data.id}/generate`, { method: "POST" });
            setItems([{ ...data, status: "generating" }, ...items]);
            setShowCreateModal(false);
            setNewTheme("");
            setNewAngle("");
            setNewKeywords("");
        } catch (error) {
            console.error("Failed to create article:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const triggerRegenerate = async (id: string) => {
        setActionLoading(id);
        try {
            await fetch(`/api/content-studio/${id}/generate`, { method: "POST" });
            setItems(items.map((i) => (i.id === id ? { ...i, status: "generating" } : i)));
        } catch { } finally { setActionLoading(null); }
    };

    const triggerPublish = async (id: string) => {
        setActionLoading(id);
        try {
            await fetch(`/api/content-studio/${id}/publish`, { method: "POST" });
            setItems(items.map((i) => (i.id === id ? { ...i, status: "publishing" } : i)));
        } catch { } finally { setActionLoading(null); }
    };

    const filteredItems = filter === "all" ? items : items.filter((i) => i.status === filter);

    const stats = {
        total: items.length,
        draft: items.filter((i) => i.status === "draft").length,
        published: items.filter((i) => i.status === "published").length,
        generating: items.filter((i) => ["generating", "publishing"].includes(i.status)).length,
    };

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* ヘッダー */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                    <h1 className="section-header" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        ✍️ コンテンツスタジオ
                    </h1>
                    <p className="section-subheader">テーマを入れるだけ。AIが記事を書いて公開まで。</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    記事を書く
                </button>
            </div>

            {/* フロー表示 */}
            <div className="card" style={{ padding: "12px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span className="badge-review">① テーマ入力</span>
                    <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                    <span className="badge-processing">② AI生成</span>
                    <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                    <span className="badge-review">③ レビュー</span>
                    <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                    <span className="badge-done">④ 公開+X投稿</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>MORODAS / OpenClaw / CLI 共通</span>
            </div>

            {/* 統計カード */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                    { label: "全記事", value: stats.total, color: "var(--text)" },
                    { label: "レビュー待ち", value: stats.draft, color: "var(--primary)" },
                    { label: "処理中", value: stats.generating, color: "var(--color-processing-text)" },
                    { label: "公開済み", value: stats.published, color: "var(--success)" },
                ].map((s) => (
                    <div key={s.label} className="card" style={{ padding: 16, textAlign: "center" }}>
                        <p style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* フィルター */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {[
                    { key: "all", label: "すべて" },
                    { key: "generating", label: "生成中" },
                    { key: "draft", label: "レビュー待ち" },
                    { key: "published", label: "公開済み" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`filter-pill ${filter === f.key ? "active" : ""}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* コンテンツ一覧 */}
            {isLoading ? (
                <div className="flex-center" style={{ padding: 80 }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>まだコンテンツがありません</h3>
                    <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>「記事を書く」からテーマを入力してください。</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>
                        💡 OpenClawからも可：<code style={{ background: "var(--bg-input)", padding: "2px 8px", borderRadius: 4 }}>記事を書いて：AI導入の失敗事例</code>
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        最初の記事を作る
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredItems.map((item) => {
                        const si = getStatus(item.status);
                        const isActing = actionLoading === item.id;
                        return (
                            <div key={item.id} className="card" style={{ padding: "16px 20px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1, cursor: item.articleBody ? "pointer" : "default" }} onClick={() => item.articleBody && setSelectedItem(item)}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{item.title}</h3>
                                            <span className={si.badgeClass}>
                                                {item.status === "generating" || item.status === "publishing" ? "⏳ " : ""}
                                                {si.label}
                                            </span>
                                            {item.source && (
                                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "var(--bg-surface)", color: "var(--text-muted)" }}>
                                                    via {item.source}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                                            {item.angle && <span>🎯 {item.angle}</span>}
                                            {item.keywords && <span>🏷️ {item.keywords}</span>}
                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <Clock size={12} />
                                                {new Date(item.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
                                        {item.status === "candidate" && (
                                            <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => triggerRegenerate(item.id)} disabled={isActing}>
                                                {isActing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                AIで生成
                                            </button>
                                        )}
                                        {item.status === "draft" && (
                                            <>
                                                <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, borderRadius: 8, cursor: "pointer" }} onClick={() => setSelectedItem(item)}>
                                                    <Eye size={14} /> レビュー
                                                </button>
                                                <button className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, borderRadius: 8, cursor: "pointer" }} onClick={() => triggerRegenerate(item.id)} disabled={isActing}>
                                                    <RotateCcw size={14} /> 再生成
                                                </button>
                                                <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13, background: "linear-gradient(135deg, var(--success), #7AB89A)" }} onClick={() => triggerPublish(item.id)} disabled={isActing}>
                                                    {isActing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                                                    公開 + X投稿
                                                </button>
                                            </>
                                        )}
                                        {item.status === "published" && item.wpPostUrl && (
                                            <a href={item.wpPostUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6, borderRadius: 8, textDecoration: "none", color: "var(--success)" }}>
                                                <Globe size={14} /> 記事を見る
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 新規作成モーダル */}
            {showCreateModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(62, 44, 35, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "var(--color-surface-50)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, border: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(62, 44, 35, 0.15)" }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                            <Sparkles size={20} style={{ color: "var(--primary)" }} />
                            〇〇の記事を書いて
                        </h2>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>テーマを入れて「生成」を押すだけ。AIがアウトライン→執筆→編集を自動で行います。</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>テーマ *</label>
                                <input
                                    type="text"
                                    value={newTheme}
                                    onChange={(e) => setNewTheme(e.target.value)}
                                    className="design-textarea"
                                    style={{ minHeight: "auto", padding: "12px 14px", fontSize: 16 }}
                                    placeholder="例：AI導入の失敗事例と対策"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && createArticle()}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
                                    独自の切り口 <span style={{ fontSize: 12, color: "var(--text-muted)" }}>（任意）</span>
                                </label>
                                <input
                                    type="text"
                                    value={newAngle}
                                    onChange={(e) => setNewAngle(e.target.value)}
                                    className="design-textarea"
                                    style={{ minHeight: "auto", padding: "12px 14px" }}
                                    placeholder="例：中小企業の現場目線で、実体験ベース"
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
                                    キーワード <span style={{ fontSize: 12, color: "var(--text-muted)" }}>（任意、カンマ区切り）</span>
                                </label>
                                <input
                                    type="text"
                                    value={newKeywords}
                                    onChange={(e) => setNewKeywords(e.target.value)}
                                    className="design-textarea"
                                    style={{ minHeight: "auto", padding: "12px 14px" }}
                                    placeholder="例：AI, 業務効率化, DX失敗"
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: 16, padding: 12, background: "var(--bg-surface)", borderRadius: 8, textAlign: "center" }}>
                            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>📋 テーマだけでOK。切り口とキーワードはAIが自動で補完します。</p>
                        </div>

                        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                                キャンセル
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={createArticle} disabled={!newTheme.trim() || isCreating}>
                                {isCreating ? (
                                    <><Loader2 size={16} className="animate-spin" /> 生成開始中…</>
                                ) : (
                                    <><Send size={16} /> 生成スタート</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 記事プレビュー */}
            {selectedItem && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(62, 44, 35, 0.4)", display: "flex", justifyContent: "flex-end", zIndex: 50, backdropFilter: "blur(4px)" }} onClick={() => setSelectedItem(null)}>
                    <div style={{ background: "var(--color-surface-50)", width: "100%", maxWidth: 640, height: "100%", overflowY: "auto", borderLeft: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
                        {/* ヘッダー */}
                        <div style={{ position: "sticky", top: 0, background: "var(--color-surface-50)", borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{selectedItem.title}</h2>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                    <span className={getStatus(selectedItem.status).badgeClass}>{getStatus(selectedItem.status).label}</span>
                                    {selectedItem.source && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>via {selectedItem.source}</span>}
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {selectedItem.status === "draft" && (
                                    <>
                                        <button className="btn-secondary" style={{ padding: "8px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 4, borderRadius: 8, cursor: "pointer" }} onClick={() => { triggerRegenerate(selectedItem.id); setSelectedItem(null); }}>
                                            <RotateCcw size={14} /> 再生成
                                        </button>
                                        <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: 13, background: "linear-gradient(135deg, var(--success), #7AB89A)" }} onClick={() => { triggerPublish(selectedItem.id); setSelectedItem(null); }}>
                                            <Rocket size={14} /> 公開 + X投稿
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setSelectedItem(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--text-muted)", fontSize: 20 }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        {/* 本文 */}
                        <div style={{ padding: 24 }}>
                            {selectedItem.articleBody ? (
                                <div className="prose" style={{ whiteSpace: "pre-wrap" }}>
                                    {selectedItem.articleBody}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                                    <FileText size={32} style={{ margin: "0 auto 12px", display: "block" }} />
                                    <p>まだ本文が生成されていません。</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
