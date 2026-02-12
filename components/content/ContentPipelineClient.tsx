"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Zap,
    Flame,
    Star,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Send,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Sparkles,
    FileText,
    Globe,
    RefreshCw,
    LayoutGrid,
    List,
} from "lucide-react";

interface ContentIdea {
    id: string;
    title: string;
    source: string | null;
    sourceUrl: string | null;
    angle: string | null;
    score: number;
    keywords: string | null;
    summary: string | null;
    status: string;
    articleBody: string | null;
    articleMeta: string | null;
    wpPostId: number | null;
    wpPostUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; iconColor: string; icon: typeof Zap }> = {
    candidate: { label: "候補", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", iconColor: "text-amber-600", icon: Star },
    approved: { label: "承認済", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", iconColor: "text-blue-600", icon: CheckCircle2 },
    generating: { label: "生成中...", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", iconColor: "text-purple-600", icon: Loader2 },
    draft: { label: "ドラフト完成", color: "text-teal-700", bg: "bg-teal-50 border-primary-200", iconColor: "text-primary-600", icon: FileText },
    publishing: { label: "公開中...", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", iconColor: "text-orange-600", icon: Loader2 },
    published: { label: "公開済", color: "text-primary-700", bg: "bg-primary-50 border-primary-200", iconColor: "text-primary-600", icon: Globe },
    rejected: { label: "却下", color: "text-surface-500", bg: "bg-surface-50 border-surface-200", iconColor: "text-muted", icon: XCircle },
};

function ScoreBadge({ score }: { score: number }) {
    const style =
        score >= 80
            ? "bg-red-100 text-red-700"
            : score >= 60
                ? "bg-amber-100 text-amber-700"
                : score >= 40
                    ? "bg-blue-100 text-blue-700"
                    : "bg-surface-100 text-foreground";

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${style}`}>
            <Flame size={12} />
            {score}点
        </span>
    );
}

function SourceTag({ source }: { source: string | null }) {
    if (!source) return null;
    const colors: Record<string, string> = {
        TechCrunch: "bg-green-100 text-green-700",
        HackerNews: "bg-orange-100 text-orange-700",
        "AI-Scholar": "bg-blue-100 text-blue-700",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[source] || "bg-surface-100 text-foreground"}`}>
            {source}
        </span>
    );
}

function IdeaCard({
    idea,
    onGenerate,
    onPublish,
    onReject,
}: {
    idea: ContentIdea;
    onGenerate: (id: string) => void;
    onPublish: (id: string) => void;
    onReject: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const config = statusConfig[idea.status] || statusConfig.candidate;
    const StatusIcon = config.icon;
    const isSpinning = idea.status === "generating" || idea.status === "publishing";

    return (
        <div className="card p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <ScoreBadge score={idea.score} />
                        <SourceTag source={idea.source} />
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${config.color}`}>
                            <StatusIcon size={12} className={isSpinning ? "animate-spin" : ""} />
                            {config.label}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{idea.title}</h3>
                    {idea.angle && (
                        <p className="text-sm text-muted mt-1">
                            <span className="font-medium text-surface-500">切り口:</span> {idea.angle}
                        </p>
                    )}
                </div>
            </div>

            {/* Summary */}
            {idea.summary && (
                <div className="mt-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 text-xs text-surface-500 hover:text-sidebar-hover transition-colors"
                    >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        要約を{expanded ? "隠す" : "見る"}
                    </button>
                    {expanded && (
                        <p className="mt-2 text-sm text-sidebar-hover bg-surface-50 rounded-lg p-3 leading-relaxed border border-surface-200">
                            {idea.summary}
                        </p>
                    )}
                </div>
            )}

            {/* Keywords */}
            {idea.keywords && (() => {
                try {
                    const kws = JSON.parse(idea.keywords);
                    return (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {kws.map((kw: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-surface-100 text-foreground rounded-full text-xs font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    );
                } catch {
                    return null;
                }
            })()}

            {/* Draft Preview */}
            {(idea.status === "draft" || idea.status === "published") && idea.articleBody && (
                <div className="mt-4">
                    <button
                        onClick={() => setPreviewOpen(!previewOpen)}
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-teal-700 transition-colors font-semibold"
                    >
                        <FileText size={14} />
                        {previewOpen ? "プレビューを閉じる" : "記事プレビュー"}
                        {previewOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {previewOpen && (
                        <div className="mt-3 bg-white rounded-lg p-4 max-h-96 overflow-y-auto border border-surface-200">
                            <article className="prose prose-sm prose-slate max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {idea.articleBody.substring(0, 8000)}
                                </ReactMarkdown>
                                {idea.articleBody.length > 8000 && (
                                    <p className="text-xs text-muted italic mt-4">... 残り {(idea.articleBody.length - 8000).toLocaleString()} 字（WordPress で確認）</p>
                                )}
                            </article>
                            {idea.articleMeta && (() => {
                                try {
                                    const meta = JSON.parse(idea.articleMeta);
                                    return (
                                        <div className="mt-4 pt-3 border-t border-surface-200 space-y-2">
                                            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">SEO メタデータ</p>
                                            {meta.seo?.final_title && (
                                                <p className="text-xs text-muted">
                                                    <span className="font-medium text-foreground">SEOタイトル:</span> {meta.seo.final_title}
                                                    <span className="ml-2 text-muted">({meta.seo.final_title.length}文字)</span>
                                                </p>
                                            )}
                                            {meta.seo?.meta_description && (
                                                <p className="text-xs text-muted">
                                                    <span className="font-medium text-foreground">Description:</span> {meta.seo.meta_description}
                                                </p>
                                            )}
                                            {meta.seo?.focus_keyword && (
                                                <p className="text-xs text-muted">
                                                    <span className="font-medium text-foreground">フォーカスKW:</span> {meta.seo.focus_keyword}
                                                </p>
                                            )}
                                            {meta.seo?.tags && meta.seo.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {meta.seo.tags.map((tag: string, i: number) => (
                                                        <span key={i} className="px-1.5 py-0.5 bg-surface-100 text-surface-500 rounded text-xs">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-xs text-muted">
                                                <span className="font-medium text-foreground">文字数:</span>{" "}
                                                {idea.articleBody!.length.toLocaleString()}字
                                            </p>
                                            {meta.social?.twitter_post && (
                                                <div className="mt-2 p-2 bg-surface-50 rounded border border-surface-200">
                                                    <p className="text-xs font-medium text-surface-500 mb-1">📱 X/Twitter投稿案:</p>
                                                    <p className="text-xs text-sidebar-hover">{meta.social.twitter_post}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                } catch {
                                    return null;
                                }
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* Published Link */}
            {idea.status === "published" && idea.wpPostUrl && (
                <a
                    href={idea.wpPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                    <ExternalLink size={14} />
                    WordPress で見る →
                </a>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-100">
                {idea.status === "candidate" && (
                    <>
                        <button
                            onClick={() => onGenerate(idea.id)}
                            className="btn-primary flex-1 justify-center"
                        >
                            <Sparkles size={16} />
                            この記事を書く
                        </button>
                        <button
                            onClick={() => onReject(idea.id)}
                            className="px-3 py-2 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            <XCircle size={18} />
                        </button>
                    </>
                )}
                {idea.status === "generating" && (
                    <div className="flex-1 flex items-center justify-center gap-3 badge-processing py-3 rounded-lg">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm font-semibold">記事を生成中... (約15-20分)</span>
                    </div>
                )}
                {idea.status === "draft" && (
                    <button
                        onClick={() => onPublish(idea.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                    >
                        <Send size={16} />
                        WordPress に公開
                    </button>
                )}
                {idea.status === "publishing" && (
                    <div className="flex-1 flex items-center justify-center gap-3 bg-orange-50 text-orange-700 py-3 rounded-lg border border-orange-200">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm font-semibold">WordPress に公開中...</span>
                    </div>
                )}
                {idea.status === "published" && (
                    <div className="flex-1 flex items-center justify-center gap-2 badge-done py-2.5 rounded-lg font-semibold text-sm">
                        <CheckCircle2 size={16} />
                        公開完了
                    </div>
                )}
            </div>
        </div>
    );
}

// Kanban Column Component
function KanbanColumn({
    title,
    icon: Icon,
    iconColor,
    borderColor,
    ideas,
    onGenerate,
    onPublish,
    onReject,
}: {
    title: string;
    icon: typeof Zap;
    iconColor: string;
    borderColor: string;
    ideas: ContentIdea[];
    onGenerate: (id: string) => void;
    onPublish: (id: string) => void;
    onReject: (id: string) => void;
}) {
    return (
        <div className={`flex-1 min-w-[280px] max-w-[350px]`}>
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${borderColor}`}>
                <Icon size={16} className={iconColor} />
                <h3 className="text-sm font-bold text-sidebar-hover">{title}</h3>
                <span className="ml-auto text-xs font-bold bg-surface-100 text-foreground px-2 py-0.5 rounded-full">
                    {ideas.length}
                </span>
            </div>
            <div className="space-y-3">
                {ideas.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted bg-surface-50 rounded-lg border border-dashed border-surface-200">
                        なし
                    </div>
                ) : (
                    ideas.map((idea) => (
                        <IdeaCard
                            key={idea.id}
                            idea={idea}
                            onGenerate={onGenerate}
                            onPublish={onPublish}
                            onReject={onReject}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default function ContentPipelineClient({
    initialIdeas,
}: {
    initialIdeas: ContentIdea[];
}) {
    const [ideas, setIdeas] = useState<ContentIdea[]>(initialIdeas);
    const [filter, setFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const hasGenerating = ideas.some((i) => i.status === "generating" || i.status === "publishing");

    const refreshIdeas = useCallback(async () => {
        try {
            const res = await fetch("/api/content/pipeline/candidates");
            const { data } = await res.json();
            if (data) setIdeas(data);
        } catch (err) {
            console.error("Failed to refresh:", err);
        }
    }, []);

    useEffect(() => {
        if (!hasGenerating) return;
        const interval = setInterval(refreshIdeas, 10000);
        return () => clearInterval(interval);
    }, [hasGenerating, refreshIdeas]);

    const handleGenerate = async (ideaId: string) => {
        setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: "generating" } : i)));
        try {
            const res = await fetch("/api/content/pipeline/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ideaId }),
            });
            if (!res.ok) {
                const err = await res.json();
                alert(`エラー: ${err.error?.message || "記事生成に失敗しました"}`);
                setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: "candidate" } : i)));
            }
        } catch {
            alert("記事生成のトリガーに失敗しました");
            setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: "candidate" } : i)));
        }
    };

    const handlePublish = async (ideaId: string) => {
        if (!confirm("WordPress に下書きとして投稿しますか？")) return;
        setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: "publishing" } : i)));
        try {
            const res = await fetch("/api/content/pipeline/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ideaId }),
            });
            const result = await res.json();
            if (result.success) {
                await refreshIdeas();
            } else {
                alert(`エラー: ${result.error?.message || "公開に失敗しました"}`);
                setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: "draft" } : i)));
            }
        } catch {
            alert("公開に失敗しました");
            setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: "draft" } : i)));
        }
    };

    const handleReject = async (ideaId: string) => {
        setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: "rejected" } : i)));
        try {
            await fetch("/api/content/pipeline/candidates", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: ideaId, status: "rejected" }),
            });
        } catch {
            console.error("Failed to reject");
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshIdeas();
        setIsRefreshing(false);
    };

    const filteredIdeas = filter === "all" ? ideas.filter((i) => i.status !== "rejected") : ideas.filter((i) => i.status === filter);

    const stats = {
        candidates: ideas.filter((i) => i.status === "candidate").length,
        generating: ideas.filter((i) => i.status === "generating").length,
        drafts: ideas.filter((i) => i.status === "draft").length,
        published: ideas.filter((i) => i.status === "published").length,
    };

    const filters = [
        { key: "all", label: "すべて", count: ideas.filter((i) => i.status !== "rejected").length },
        { key: "candidate", label: "候補", count: stats.candidates },
        { key: "generating", label: "生成中", count: stats.generating },
        { key: "draft", label: "ドラフト", count: stats.drafts },
        { key: "published", label: "公開済", count: stats.published },
    ];

    return (
        <div className="animate-in space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-5 border-l-4 border-amber-500">
                    <p className="text-sm text-muted mb-1">ネタ候補</p>
                    <p className="text-3xl font-bold text-foreground">{stats.candidates}</p>
                </div>
                <div className="card p-5 border-l-4 border-purple-500">
                    <p className="text-sm text-muted mb-1">生成中</p>
                    <p className="text-3xl font-bold text-foreground">{stats.generating}</p>
                </div>
                <div className="card p-5 border-l-4 border-primary-500">
                    <p className="text-sm text-muted mb-1">ドラフト</p>
                    <p className="text-3xl font-bold text-foreground">{stats.drafts}</p>
                </div>
                <div className="card p-5 border-l-4 border-primary-500">
                    <p className="text-sm text-muted mb-1">公開済</p>
                    <p className="text-3xl font-bold text-foreground">{stats.published}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`filter-pill text-xs ${filter === f.key ? "active" : ""}`}
                        >
                            {f.label} {f.count > 0 && <span className="ml-1 opacity-70">({f.count})</span>}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-surface-200 overflow-hidden">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-surface-200 text-sidebar-hover" : "text-muted hover:text-foreground"}`}
                            title="リスト表示"
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode("kanban")}
                            className={`p-1.5 transition-colors ${viewMode === "kanban" ? "bg-surface-200 text-sidebar-hover" : "text-muted hover:text-foreground"}`}
                            title="カンバン表示"
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                        更新
                    </button>
                </div>
            </div>

            {/* Ideas Display */}
            {viewMode === "kanban" ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    <KanbanColumn
                        title="候補"
                        icon={Star}
                        iconColor="text-amber-600"
                        borderColor="border-amber-400"
                        ideas={ideas.filter((i) => i.status === "candidate")}
                        onGenerate={handleGenerate}
                        onPublish={handlePublish}
                        onReject={handleReject}
                    />
                    <KanbanColumn
                        title="生成中"
                        icon={Loader2}
                        iconColor="text-purple-600"
                        borderColor="border-purple-400"
                        ideas={ideas.filter((i) => i.status === "generating")}
                        onGenerate={handleGenerate}
                        onPublish={handlePublish}
                        onReject={handleReject}
                    />
                    <KanbanColumn
                        title="ドラフト"
                        icon={FileText}
                        iconColor="text-primary-600"
                        borderColor="border-primary-400"
                        ideas={ideas.filter((i) => i.status === "draft")}
                        onGenerate={handleGenerate}
                        onPublish={handlePublish}
                        onReject={handleReject}
                    />
                    <KanbanColumn
                        title="公開済"
                        icon={Globe}
                        iconColor="text-primary-600"
                        borderColor="border-primary-400"
                        ideas={ideas.filter((i) => i.status === "published")}
                        onGenerate={handleGenerate}
                        onPublish={handlePublish}
                        onReject={handleReject}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredIdeas.length === 0 ? (
                        <div className="card p-12 text-center">
                            <Clock size={40} className="mx-auto text-surface-300 mb-3" />
                            <p className="text-surface-500 font-medium">
                                {filter === "all"
                                    ? "ネタ候補がまだありません"
                                    : `${filters.find((f) => f.key === filter)?.label}のアイテムはありません`}
                            </p>
                            <p className="text-xs text-muted mt-1">毎朝7:00にAIが自動でネタを収集します</p>
                        </div>
                    ) : (
                        filteredIdeas.map((idea) => (
                            <IdeaCard
                                key={idea.id}
                                idea={idea}
                                onGenerate={handleGenerate}
                                onPublish={handlePublish}
                                onReject={handleReject}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
