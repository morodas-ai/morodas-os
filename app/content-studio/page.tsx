"use client";

import { useState, useEffect } from "react";
import {
    PenTool,
    Plus,
    Clock,
    CheckCircle,
    Eye,
    Loader2,
    FileText,
    Send,
    Sparkles,
    ArrowRight,
    Globe,
    Rocket,
    Twitter,
    RotateCcw,
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

const statusFlow = [
    { key: "candidate", label: "候補", color: "bg-surface-400/10 text-surface-400", icon: FileText },
    { key: "generating", label: "生成中…", color: "bg-yellow-500/10 text-yellow-400", icon: Loader2 },
    { key: "draft", label: "レビュー待ち", color: "bg-primary-500/10 text-primary-400", icon: Eye },
    { key: "publishing", label: "公開処理中…", color: "bg-yellow-500/10 text-yellow-400", icon: Loader2 },
    { key: "published", label: "公開済み ✨", color: "bg-green-500/10 text-green-400", icon: Globe },
    { key: "rejected", label: "不採用", color: "bg-red-500/10 text-red-300", icon: FileText },
];

function getStatusInfo(status: string) {
    return statusFlow.find((s) => s.key === status) || statusFlow[0];
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
        // 30秒ごとにポーリング（生成中の更新を拾う）
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

    // ① テーマ登録
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

            // 作成したら即n8nに生成トリガー
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

    // ② AI再生成
    const triggerRegenerate = async (id: string) => {
        setActionLoading(id);
        try {
            await fetch(`/api/content-studio/${id}/generate`, { method: "POST" });
            setItems(items.map((i) => (i.id === id ? { ...i, status: "generating" } : i)));
        } catch (error) {
            console.error("Failed to trigger generation:", error);
        } finally {
            setActionLoading(null);
        }
    };

    // ③ WordPress公開 + X投稿
    const triggerPublish = async (id: string) => {
        setActionLoading(id);
        try {
            await fetch(`/api/content-studio/${id}/publish`, { method: "POST" });
            setItems(items.map((i) => (i.id === id ? { ...i, status: "publishing" } : i)));
        } catch (error) {
            console.error("Failed to trigger publish:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredItems = filter === "all" ? items : items.filter((i) => i.status === filter);

    const stats = {
        total: items.length,
        draft: items.filter((i) => i.status === "draft").length,
        published: items.filter((i) => i.status === "published").length,
        generating: items.filter((i) => ["generating", "publishing"].includes(i.status)).length,
    };

    return (
        <div className="max-w-6xl">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-surface-50 flex items-center gap-3">
                        <PenTool size={28} className="text-primary-400" />
                        コンテンツスタジオ
                    </h1>
                    <p className="text-muted mt-1">テーマを入れるだけ。AIが記事を書いて公開まで。</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-400 text-white rounded-xl font-semibold hover:from-primary-400 hover:to-primary-300 transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                >
                    <Plus size={20} />
                    記事を書く
                </button>
            </div>

            {/* フロー説明 */}
            <div className="bg-sidebar/50 rounded-xl p-4 mb-6 border border-sidebar-hover">
                <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded">① テーマ入力</span>
                        <ArrowRight size={12} />
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">② AI生成</span>
                        <ArrowRight size={12} />
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">③ レビュー</span>
                        <ArrowRight size={12} />
                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">④ 公開+X投稿</span>
                    </div>
                    <span className="text-surface-400">MORODAS / OpenClaw / CLI 共通パイプライン</span>
                </div>
            </div>

            {/* 統計 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "全記事", value: stats.total, color: "text-surface-300" },
                    { label: "レビュー待ち", value: stats.draft, color: "text-primary-400" },
                    { label: "処理中", value: stats.generating, color: "text-yellow-400" },
                    { label: "公開済み", value: stats.published, color: "text-green-400" },
                ].map((s) => (
                    <div key={s.label} className="bg-sidebar rounded-xl p-4 border border-sidebar-hover text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-muted mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* フィルター */}
            <div className="flex gap-2 mb-6">
                {[
                    { key: "all", label: "すべて" },
                    { key: "generating", label: "生成中" },
                    { key: "draft", label: "レビュー待ち" },
                    { key: "published", label: "公開済み" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === f.key
                                ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                                : "bg-sidebar text-muted hover:text-surface-300 border border-sidebar-hover"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* コンテンツ一覧 */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-primary-400" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="bg-sidebar rounded-xl p-12 border border-sidebar-hover text-center">
                    <PenTool size={48} className="mx-auto text-muted mb-4" />
                    <h3 className="text-xl font-bold text-surface-50 mb-2">まだコンテンツがありません</h3>
                    <p className="text-muted mb-4">「記事を書く」からテーマを入力してください。</p>
                    <p className="text-xs text-muted mb-6">
                        💡 OpenClawからも指示できます：<code className="bg-foreground px-2 py-0.5 rounded text-surface-300">記事を書いて：AI導入の失敗事例</code>
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-5 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-400 transition-colors"
                    >
                        最初の記事を作る
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredItems.map((item) => {
                        const statusInfo = getStatusInfo(item.status);
                        const StatusIcon = statusInfo.icon;
                        const isActionLoading = actionLoading === item.id;
                        return (
                            <div
                                key={item.id}
                                className="bg-sidebar rounded-xl p-5 border border-sidebar-hover hover:border-primary-500/30 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 cursor-pointer" onClick={() => item.articleBody && setSelectedItem(item)}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-surface-50 group-hover:text-primary-300 transition-colors">
                                                {item.title}
                                            </h3>
                                            <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                                                <StatusIcon size={12} className={item.status === "generating" || item.status === "publishing" ? "animate-spin" : ""} />
                                                {statusInfo.label}
                                            </span>
                                            {item.source && (
                                                <span className="text-xs px-2 py-0.5 rounded bg-sidebar-hover text-muted">
                                                    via {item.source}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted">
                                            {item.angle && <span>🎯 {item.angle}</span>}
                                            {item.keywords && <span>🏷️ {item.keywords}</span>}
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(item.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* アクションボタン（ステータスに応じて表示） */}
                                    <div className="flex items-center gap-2 ml-4">
                                        {/* 候補 → AIで生成 */}
                                        {item.status === "candidate" && (
                                            <button
                                                onClick={() => triggerRegenerate(item.id)}
                                                disabled={isActionLoading}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-400 text-white rounded-lg text-sm font-medium hover:from-primary-400 hover:to-primary-300 transition-all disabled:opacity-50"
                                            >
                                                {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                AIで生成
                                            </button>
                                        )}

                                        {/* レビュー待ち → 公開 or 再生成 */}
                                        {item.status === "draft" && (
                                            <>
                                                <button
                                                    onClick={() => setSelectedItem(item)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-sidebar-hover text-surface-300 rounded-lg text-sm hover:text-surface-50 transition-colors"
                                                >
                                                    <Eye size={14} />
                                                    レビュー
                                                </button>
                                                <button
                                                    onClick={() => triggerRegenerate(item.id)}
                                                    disabled={isActionLoading}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-sidebar-hover text-surface-400 rounded-lg text-sm hover:text-surface-300 transition-colors disabled:opacity-50"
                                                >
                                                    <RotateCcw size={14} />
                                                    再生成
                                                </button>
                                                <button
                                                    onClick={() => triggerPublish(item.id)}
                                                    disabled={isActionLoading}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-medium hover:from-green-500 hover:to-green-400 transition-all disabled:opacity-50"
                                                >
                                                    {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                                                    公開 + X投稿
                                                </button>
                                            </>
                                        )}

                                        {/* 公開済み → リンク */}
                                        {item.status === "published" && item.wpPostUrl && (
                                            <a
                                                href={item.wpPostUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm hover:bg-green-500/20 transition-colors"
                                            >
                                                <Globe size={14} />
                                                記事を見る
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-sidebar rounded-2xl p-8 w-full max-w-lg border border-sidebar-hover shadow-2xl">
                        <h2 className="text-2xl font-bold text-surface-50 mb-1 flex items-center gap-2">
                            <Sparkles size={22} className="text-primary-400" />
                            〇〇の記事を書いて
                        </h2>
                        <p className="text-muted text-sm mb-6">テーマを入れて「生成」を押すだけ。AIがアウトライン→執筆→編集を自動で行います。</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">テーマ *</label>
                                <input
                                    type="text"
                                    value={newTheme}
                                    onChange={(e) => setNewTheme(e.target.value)}
                                    className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 placeholder:text-muted text-lg"
                                    placeholder="例：AI導入の失敗事例と対策"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && createArticle()}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                                    独自の切り口 <span className="text-muted text-xs">（任意）</span>
                                </label>
                                <input
                                    type="text"
                                    value={newAngle}
                                    onChange={(e) => setNewAngle(e.target.value)}
                                    className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 placeholder:text-muted"
                                    placeholder="例：中小企業の現場目線で、実体験ベース"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                                    キーワード <span className="text-muted text-xs">（任意、カンマ区切り）</span>
                                </label>
                                <input
                                    type="text"
                                    value={newKeywords}
                                    onChange={(e) => setNewKeywords(e.target.value)}
                                    className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-3 text-surface-50 focus:outline-none focus:border-primary-500 placeholder:text-muted"
                                    placeholder="例：AI, 業務効率化, DX失敗"
                                />
                            </div>
                        </div>

                        <div className="mt-6 p-3 bg-foreground rounded-lg border border-sidebar-hover">
                            <p className="text-xs text-muted text-center">
                                📋 テーマだけでOK。切り口とキーワードはAIが自動で補完します。
                            </p>
                        </div>

                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-3 bg-foreground text-surface-300 rounded-xl hover:bg-sidebar-hover transition-colors font-medium"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={createArticle}
                                disabled={!newTheme.trim() || isCreating}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-400 text-white rounded-xl font-semibold disabled:opacity-50 hover:from-primary-400 hover:to-primary-300 transition-all shadow-lg shadow-primary-500/20"
                            >
                                {isCreating ? (
                                    <><Loader2 size={18} className="animate-spin" /> 生成開始中…</>
                                ) : (
                                    <><Send size={18} /> 生成スタート</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 記事プレビュー（サイドパネル） */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-end z-50 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
                    <div className="bg-sidebar w-full max-w-2xl h-full overflow-y-auto border-l border-sidebar-hover" onClick={(e) => e.stopPropagation()}>
                        {/* ヘッダー */}
                        <div className="sticky top-0 bg-sidebar/95 backdrop-blur border-b border-sidebar-hover p-6 flex items-center justify-between z-10">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-surface-50">{selectedItem.title}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    {(() => {
                                        const si = getStatusInfo(selectedItem.status);
                                        return <span className={`text-xs px-2 py-0.5 rounded-full ${si.color}`}>{si.label}</span>;
                                    })()}
                                    {selectedItem.source && <span className="text-xs text-muted">via {selectedItem.source}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedItem.status === "draft" && (
                                    <>
                                        <button
                                            onClick={() => {
                                                triggerRegenerate(selectedItem.id);
                                                setSelectedItem(null);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-sidebar-hover text-surface-300 rounded-lg text-sm hover:text-surface-50 transition-colors"
                                        >
                                            <RotateCcw size={14} /> 再生成
                                        </button>
                                        <button
                                            onClick={() => {
                                                triggerPublish(selectedItem.id);
                                                setSelectedItem(null);
                                            }}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-medium hover:from-green-500 hover:to-green-400 transition-all"
                                        >
                                            <Rocket size={14} /> 公開 + X投稿
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="text-muted hover:text-surface-300 transition-colors text-2xl ml-2"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        {/* 本文 */}
                        <div className="p-6">
                            {selectedItem.articleBody ? (
                                <div className="prose prose-invert max-w-none text-surface-200 leading-relaxed whitespace-pre-wrap text-sm">
                                    {selectedItem.articleBody}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted">
                                    <FileText size={32} className="mx-auto mb-3" />
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
