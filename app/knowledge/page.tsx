"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Brain, Plus, Search, Edit3, Trash2, Save, X, ChevronLeft,
    FileText, FolderOpen, Tag, Clock, Sparkles
} from "lucide-react";
import { format } from "date-fns";

interface KnowledgePageItem {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string;
    emoji: string;
    createdAt: string;
    updatedAt: string;
}

const CATEGORIES = [
    { id: "all", label: "すべて", emoji: "📚" },
    { id: "general", label: "一般", emoji: "📄" },
    { id: "product", label: "プロダクト", emoji: "🚀" },
    { id: "marketing", label: "マーケティング", emoji: "📣" },
    { id: "technical", label: "技術", emoji: "⚙️" },
    { id: "operations", label: "オペレーション", emoji: "📋" },
];

export default function KnowledgePage() {
    const [pages, setPages] = useState<KnowledgePageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedPage, setSelectedPage] = useState<KnowledgePageItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("general");
    const [editEmoji, setEditEmoji] = useState("📄");

    const fetchPages = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set("q", searchQuery);
            if (activeCategory !== "all") params.set("category", activeCategory);

            const res = await fetch(`/api/knowledge?${params}`);
            const { data } = await res.json();
            setPages(data || []);
        } catch (error) {
            console.error("Failed to fetch pages:", error);
        }
        setLoading(false);
    }, [searchQuery, activeCategory]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const handleCreate = async () => {
        if (!editTitle.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle,
                    content: editContent,
                    category: editCategory,
                    emoji: editEmoji,
                }),
            });
            const { data } = await res.json();
            setSelectedPage(data);
            setIsCreating(false);
            setIsEditing(false);
            fetchPages();
        } catch (error) {
            console.error("Failed to create page:", error);
        }
        setSaving(false);
    };

    const handleUpdate = async () => {
        if (!selectedPage || !editTitle.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/knowledge/${selectedPage.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle,
                    content: editContent,
                    category: editCategory,
                    emoji: editEmoji,
                }),
            });
            const { data } = await res.json();
            setSelectedPage(data);
            setIsEditing(false);
            fetchPages();
        } catch (error) {
            console.error("Failed to update page:", error);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("このページを削除しますか？")) return;
        try {
            await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
            if (selectedPage?.id === id) {
                setSelectedPage(null);
                setIsEditing(false);
            }
            fetchPages();
        } catch (error) {
            console.error("Failed to delete page:", error);
        }
    };

    const startCreate = () => {
        setEditTitle("");
        setEditContent("");
        setEditCategory("general");
        setEditEmoji("📄");
        setIsCreating(true);
        setIsEditing(true);
        setSelectedPage(null);
    };

    const startEdit = (page: KnowledgePageItem) => {
        setEditTitle(page.title);
        setEditContent(page.content);
        setEditCategory(page.category);
        setEditEmoji(page.emoji);
        setIsEditing(true);
        setIsCreating(false);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setIsCreating(false);
        if (selectedPage) {
            setEditTitle(selectedPage.title);
            setEditContent(selectedPage.content);
        }
    };

    const parseTags = (tags: string): string[] => {
        try { return JSON.parse(tags); } catch { return []; }
    };

    // =====================================
    // Page Detail / Editor View
    // =====================================
    if (selectedPage || isCreating) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back button */}
                <button
                    onClick={() => {
                        setSelectedPage(null);
                        setIsEditing(false);
                        setIsCreating(false);
                    }}
                    className="flex items-center gap-2 text-muted hover:text-primary-400 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span>ナレッジ一覧に戻る</span>
                </button>

                {/* Page header */}
                <div className="flex items-center justify-between">
                    {isEditing ? (
                        <div className="flex items-center gap-3 flex-1">
                            <input
                                value={editEmoji}
                                onChange={(e) => setEditEmoji(e.target.value)}
                                className="w-14 h-14 text-3xl text-center bg-sidebar border border-sidebar-hover rounded-xl focus:outline-none focus:border-primary-500"
                                maxLength={2}
                            />
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="ページタイトル"
                                className="flex-1 text-3xl font-bold bg-transparent border-b-2 border-sidebar-hover focus:border-primary-500 text-white outline-none pb-2"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <span className="text-4xl">{selectedPage?.emoji}</span>
                            {selectedPage?.title}
                        </h1>
                    )}
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={cancelEdit}
                                    className="px-4 py-2 text-muted hover:text-white transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={isCreating ? handleCreate : handleUpdate}
                                    disabled={saving || !editTitle.trim()}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-400 disabled:bg-foreground text-white font-semibold rounded-lg transition-colors"
                                >
                                    <Save size={16} />
                                    {saving ? "保存中..." : "保存"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => startEdit(selectedPage!)}
                                    className="flex items-center gap-2 px-4 py-2 bg-sidebar-hover hover:bg-foreground text-white rounded-lg transition-colors"
                                >
                                    <Edit3 size={16} />
                                    編集
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedPage!.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Category select */}
                {isEditing && (
                    <div className="flex items-center gap-3">
                        <FolderOpen size={16} className="text-muted" />
                        <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="bg-sidebar border border-sidebar-hover text-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                        >
                            {CATEGORIES.filter(c => c.id !== "all").map(c => (
                                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Meta info */}
                {selectedPage && !isEditing && (
                    <div className="flex items-center gap-6 text-sm text-muted">
                        <span className="flex items-center gap-1.5">
                            <FolderOpen size={14} />
                            {CATEGORIES.find(c => c.id === selectedPage.category)?.label || selectedPage.category}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            更新: {format(new Date(selectedPage.updatedAt), "yyyy/MM/dd HH:mm")}
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className="bg-sidebar/50 rounded-2xl border border-sidebar-hover p-8 min-h-[400px]">
                    {isEditing ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="ページ内容をここに入力...&#10;&#10;Markdown形式対応（将来）"
                            className="w-full h-[500px] bg-transparent text-surface-200 text-base leading-relaxed resize-none outline-none placeholder-foreground"
                        />
                    ) : (
                        <div className="prose prose-invert max-w-none">
                            {selectedPage?.content ? (
                                <pre className="whitespace-pre-wrap text-surface-200 text-base leading-relaxed font-sans">
                                    {selectedPage.content}
                                </pre>
                            ) : (
                                <p className="text-surface-500 italic">まだ内容がありません。「編集」ボタンで追加しましょう。</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // =====================================
    // Pages List View
    // =====================================
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-400 bg-clip-text text-transparent">
                        ナレッジベース
                    </h1>
                    <p className="text-muted mt-2">
                        Wiki形式のドキュメントで知識を整理・共有
                    </p>
                </div>
                <button
                    onClick={startCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-400 text-foreground font-bold rounded-lg transition-all shadow-lg hover:shadow-primary-500/20"
                >
                    <Plus size={20} />
                    新規ページ
                </button>
            </div>

            {/* Search + Categories */}
            <div className="space-y-4">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ページを検索..."
                        className="w-full bg-sidebar/50 border border-sidebar-hover rounded-xl pl-12 pr-4 py-3 text-surface-200 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id
                                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                                    : "bg-sidebar/50 text-muted border border-sidebar-hover hover:border-foreground hover:text-surface-300"
                                }`}
                        >
                            <span>{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pages Grid */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-surface-500">
                        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        読み込み中...
                    </div>
                </div>
            ) : pages.length === 0 ? (
                <div className="bg-sidebar/30 rounded-2xl border border-dashed border-sidebar-hover p-16 text-center">
                    <Brain size={56} className="mx-auto text-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-surface-300 mb-2">
                        {searchQuery ? "検索結果がありません" : "まだページがありません"}
                    </h3>
                    <p className="text-surface-500 mb-6">
                        {searchQuery
                            ? "別のキーワードで検索してみてください"
                            : "ナレッジページを作成して、チームの知識を蓄積しましょう"}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={startCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-xl transition-colors"
                        >
                            <Sparkles size={18} />
                            最初のページを作成
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page) => (
                        <button
                            key={page.id}
                            onClick={() => {
                                setSelectedPage(page);
                                setIsEditing(false);
                            }}
                            className="group bg-sidebar/50 hover:bg-sidebar border border-sidebar-hover hover:border-primary-500/30 rounded-xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="text-3xl">{page.emoji}</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-sidebar-hover text-muted">
                                    {CATEGORIES.find(c => c.id === page.category)?.label || page.category}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors mb-2 line-clamp-2">
                                {page.title}
                            </h3>
                            <p className="text-sm text-muted line-clamp-3 mb-4">
                                {page.content || "内容なし"}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-surface-500">
                                <Clock size={12} />
                                {format(new Date(page.updatedAt), "yyyy/MM/dd")}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
