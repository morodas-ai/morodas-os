"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    LayoutTemplate,
    PenTool,
    ArrowRight,
    Loader2,
    Sparkles,
    Search,
    TrendingUp,
    BarChart3,
    MessageSquare,
    Shield,
    Zap,
} from "lucide-react";
import clsx from "clsx";

interface AgentCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// カテゴリフィルター
const categories = [
    { id: "all", label: "すべて", icon: Sparkles },
    { id: "content", label: "コンテンツ", icon: PenTool },
    { id: "research", label: "リサーチ", icon: Search },
    { id: "social", label: "ソーシャル", icon: MessageSquare },
    { id: "analytics", label: "分析", icon: BarChart3 },
    { id: "growth", label: "グロース", icon: TrendingUp },
    { id: "seo", label: "SEO", icon: Search },
    { id: "security", label: "セキュリティ", icon: Shield },
];

// テンプレート定義
const templates = [
    {
        id: "news_monitor",
        title: "ニュースモニター",
        description: "業界ニュースを24時間監視し、重要なトレンドをレポート。",
        category: "analytics",
        icon: "📡",
        capabilities: ["トレンド検出", "要約生成", "アラート通知"],
    },
    {
        id: "seo_auditor",
        title: "SEO監査エージェント",
        description: "サイトのSEOスコアを分析し、改善提案を自動生成。",
        category: "seo",
        icon: "🔍",
        capabilities: ["キーワード分析", "競合比較", "改善提案"],
    },
    {
        id: "social_listener",
        title: "ソーシャルリスナー",
        description: "X/YouTube/Instagramを横断モニタリングし、ブランド言及を追跡。",
        category: "social",
        icon: "📱",
        capabilities: ["センチメント分析", "インフルエンサー特定", "トレンド速報"],
    },
    {
        id: "competitor_tracker",
        title: "競合トラッカー",
        description: "競合企業の動向を自動追跡し、差分レポートを生成。",
        category: "analytics",
        icon: "🎯",
        capabilities: ["価格監視", "機能比較", "アラート"],
    },
    {
        id: "content_planner",
        title: "コンテンツプランナー",
        description: "トレンドに基づいた週間コンテンツカレンダーを自動作成。",
        category: "social",
        icon: "📝",
        capabilities: ["トピック提案", "スケジュール作成", "パフォーマンス予測"],
    },
    {
        id: "growth_analyst",
        title: "グロースアナリスト",
        description: "KPI推移を分析し、成長ボトルネックを自動特定。",
        category: "growth",
        icon: "📈",
        capabilities: ["ファネル分析", "コホート分析", "A/Bテスト提案"],
    },
    {
        id: "security_monitor",
        title: "セキュリティモニター",
        description: "ドメイン・サーバーの脆弱性を定期チェック。",
        category: "security",
        icon: "🛡️",
        capabilities: ["脆弱性スキャン", "SSL監視", "レポート生成"],
    },
    {
        id: "lead_scorer",
        title: "リードスコアラー",
        description: "インバウンドリードを自動スコアリングし、優先度を判定。",
        category: "growth",
        icon: "⚡",
        capabilities: ["スコアリング", "セグメント分類", "フォローアップ提案"],
    },
    // --- 実用テンプレート（kazuakiワークフロー対応） ---
    {
        id: "techcrunch_monitor",
        title: "TechCrunchモニター",
        description: "TechCrunch・HackerNewsの最新記事を毎日収集し、和文要約レポートを生成。",
        category: "research",
        icon: "🌐",
        capabilities: ["RSS収集", "AI要約", "トレンド分類", "日本語レポート"],
    },
    {
        id: "article_drafter",
        title: "記事ドラフト生成",
        description: "テーマとキーワードから4,000字のブログ記事ドラフトを自動生成。SEOメタデータ付き。",
        category: "content",
        icon: "✍️",
        capabilities: ["構成設計", "セクション執筆", "SEOメタ生成", "WordPress連携"],
    },
    {
        id: "interview_prep",
        title: "面接準備アシスタント",
        description: "求人票と履歴書から質問シート・評価基準・候補者レポートを自動生成。",
        category: "research",
        icon: "🎤",
        capabilities: ["質問シート作成", "評価基準設計", "候補者分析", "振り返りレポート"],
    },
    {
        id: "market_analyst",
        title: "予測市場アナリスト",
        description: "Polymarket等の予測市場を分析し、エッジのある機会を特定。",
        category: "analytics",
        icon: "📊",
        capabilities: ["市場スキャン", "確率推定", "Kelly基準", "リスク評価"],
    },
    {
        id: "x_auto_poster",
        title: "X自動投稿エージェント",
        description: "トレンドとオーディエンスに基づき、最適なタイミングでXに自動投稿。",
        category: "social",
        icon: "🐦",
        capabilities: ["投稿生成", "最適時間分析", "ハッシュタグ提案", "スレッド作成"],
    },
    {
        id: "code_reviewer",
        title: "コードレビューエージェント",
        description: "PRの差分を読み、セキュリティ・パフォーマンス・可読性の観点からレビュー。",
        category: "security",
        icon: "🔬",
        capabilities: ["脆弱性検出", "パフォーマンス分析", "コード品質", "改善提案"],
    },
];

export default function AgentCreationModal({ isOpen, onClose }: AgentCreationModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<"choose" | "template">("choose");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [creating, setCreating] = useState<string | null>(null);

    if (!isOpen) return null;

    const filteredTemplates =
        selectedCategory === "all"
            ? templates
            : templates.filter((t) => t.category === selectedCategory);

    const handleCreateFromTemplate = async (template: typeof templates[0]) => {
        setCreating(template.id);
        try {
            const res = await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: template.title,
                    type: template.category,
                    description: template.description,
                    keyCapabilities: JSON.stringify(template.capabilities),
                }),
            });
            if (res.ok) {
                onClose();
                router.push("/agents");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to create agent:", error);
        }
        setCreating(null);
    };

    const handleScratch = () => {
        onClose();
        router.push("/agents/new");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl max-h-[85vh] bg-foreground border border-sidebar-hover rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-sidebar-hover/50">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {step === "choose" ? "エージェントを作成" : "テンプレートを選択"}
                        </h2>
                        <p className="text-sm text-muted mt-0.5">
                            {step === "choose"
                                ? "テンプレートから始めるか、ゼロから構築するかを選択してください。"
                                : "用途に合ったテンプレートを選んで素早くスタート。"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-white hover:bg-sidebar-hover rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                    {step === "choose" ? (
                        /* Step 1: Choose method */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Template option */}
                            <button
                                onClick={() => setStep("template")}
                                className="group relative bg-sidebar/50 hover:bg-primary-500/10 border border-sidebar-hover hover:border-primary-500/50 rounded-2xl p-8 text-left transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <LayoutTemplate size={32} className="text-primary-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">テンプレートから作成</h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    用意されたテンプレートを選んで、すぐに稼働できるエージェントを作成します。カスタマイズも可能です。
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    テンプレートを見る <ArrowRight size={16} />
                                </div>
                            </button>

                            {/* Scratch option */}
                            <button
                                onClick={handleScratch}
                                className="group relative bg-sidebar/50 hover:bg-purple-500/10 border border-sidebar-hover hover:border-purple-500/50 rounded-2xl p-8 text-left transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <PenTool size={32} className="text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">ゼロから構築</h3>
                                <p className="text-sm text-muted leading-relaxed">
                                    名前、役割、モデル、ツール連携を自由に設定して、完全カスタムのエージェントを作成します。
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    設定画面へ <ArrowRight size={16} />
                                </div>
                            </button>
                        </div>
                    ) : (
                        /* Step 2: Template selection */
                        <div className="space-y-4">
                            {/* Category filter */}
                            <div className="flex gap-2 flex-wrap pb-2">
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={clsx(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                                selectedCategory === cat.id
                                                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                                                    : "bg-sidebar text-muted hover:bg-sidebar-hover hover:text-white"
                                            )}
                                        >
                                            <Icon size={14} />
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Back button */}
                            <button
                                onClick={() => setStep("choose")}
                                className="text-sm text-muted hover:text-white transition-colors flex items-center gap-1"
                            >
                                ← 戻る
                            </button>

                            {/* Template grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="group bg-sidebar/50 hover:bg-sidebar border border-sidebar-hover hover:border-primary-500/30 rounded-xl p-4 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{template.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-white text-sm">
                                                    {template.title}
                                                </h4>
                                                <p className="text-xs text-muted mt-1 line-clamp-2">
                                                    {template.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {template.capabilities.map((cap) => (
                                                        <span
                                                            key={cap}
                                                            className="px-2 py-0.5 rounded-full bg-sidebar-hover/50 text-[10px] text-surface-300"
                                                        >
                                                            {cap}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCreateFromTemplate(template)}
                                                disabled={creating !== null}
                                                className="shrink-0 p-2 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                {creating === template.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Zap size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
