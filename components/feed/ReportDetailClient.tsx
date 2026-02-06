"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Share2,
    Edit3,
    Newspaper,
    ExternalLink,
    ThumbsUp,
    MessageCircle,
    Repeat2,
    Link as LinkIcon,
    Check,
    ChevronDown,
    FileText,
    Code2,
    Clock,
    Zap
} from "lucide-react";
import clsx from "clsx";

type ViewMode = "output" | "detail";

interface ReportDetailClientProps {
    report: {
        id: string;
        title: string;
        status: string;
        createdAt: string;
        agent: {
            name: string;
            type?: string;
        };
    };
    content: {
        summary?: string;
        topics?: Array<{ title: string; content: string }>;
        insights?: Array<{ area: string; strategy: string; expected: string }>;
        recommendedActions?: string[];
        sns?: Array<{ platform: string; author: string; content: string; likes: number; retweets: number; replies: number }>;
        sources?: Array<{ name: string; url: string }>;
    };
    runDetails?: {
        prompt?: string;
        duration?: number;
        toolsUsed?: string[];
        createdAt?: string;
    };
}

const statusOptions = [
    { id: "review", label: "レビュー必要", color: "bg-amber-100 text-amber-700" },
    { id: "processing", label: "処理中", color: "bg-blue-100 text-blue-700" },
    { id: "done", label: "完了", color: "bg-emerald-100 text-emerald-700" },
    { id: "archived", label: "アーカイブ", color: "bg-slate-100 text-slate-600" },
];

export default function ReportDetailClient({ report, content, runDetails }: ReportDetailClientProps) {
    const router = useRouter();
    const [status, setStatus] = useState(report.status);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("output");

    const currentStatus = statusOptions.find((s) => s.id === status) || statusOptions[0];

    // ステータス変更
    const updateStatus = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await fetch(`/api/reports/${report.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setStatus(newStatus);
            setIsStatusOpen(false);
        } catch (error) {
            console.error("Failed to update status:", error);
        }
        setIsUpdating(false);
    };

    // URLをコピー
    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // タスクに追加
    const addToTasks = async (action: string) => {
        try {
            await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: action,
                    reportId: report.id,
                    priority: "medium",
                }),
            });
            alert("タスクに追加しました");
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    };

    // 目次を動的に生成
    const toc = [
        { id: "summary", label: "エグゼクティブ・サマリー" },
        ...(content.topics ? [{ id: "topics", label: "主要トピックと背景分析" }] : []),
        ...(content.insights ? [{ id: "insights", label: "戦略的インサイトと推奨アクション" }] : []),
        ...(content.sns ? [{ id: "sns", label: "SNS・ニュース動向" }] : []),
        ...(content.sources ? [{ id: "sources", label: "情報ソース" }] : []),
    ];

    return (
        <div className="animate-in">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
                <Link href="/feed" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <ArrowLeft size={20} />
                    <span>フィードに戻る</span>
                </Link>
                <div className="flex items-center gap-2">
                    {/* Output / Detail タブ切り替え */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("output")}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "output"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <FileText size={14} />
                            Output
                        </button>
                        <button
                            onClick={() => setViewMode("detail")}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                viewMode === "detail"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Code2 size={14} />
                            Detail
                        </button>
                    </div>
                    <button
                        onClick={copyUrl}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Share2 size={16} />
                        {copied ? "コピーしました" : "共有"}
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                        <Edit3 size={16} />
                        編集
                    </button>
                </div>
            </div>

            {/* Detail View (プロンプト・実行詳細) */}
            {viewMode === "detail" && (
                <div className="mb-8 space-y-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Code2 size={20} className="text-emerald-600" />
                            実行詳細
                        </h3>

                        {/* 実行メタ情報 */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                    <Newspaper size={14} />
                                    エージェント
                                </div>
                                <div className="font-semibold text-slate-800">{report.agent.name}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                    <Clock size={14} />
                                    実行時間
                                </div>
                                <div className="font-semibold text-slate-800">
                                    {runDetails?.duration ? `${runDetails.duration}秒` : "N/A"}
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                    <Zap size={14} />
                                    使用ツール
                                </div>
                                <div className="font-semibold text-slate-800">
                                    {runDetails?.toolsUsed?.length || 0}個
                                </div>
                            </div>
                        </div>

                        {/* 使用ツール一覧 */}
                        {runDetails?.toolsUsed && runDetails.toolsUsed.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-slate-600 mb-2">使用されたツール</h4>
                                <div className="flex flex-wrap gap-2">
                                    {runDetails.toolsUsed.map((tool, i) => (
                                        <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* プロンプト表示 */}
                        <div>
                            <h4 className="text-sm font-medium text-slate-600 mb-2">使用されたプロンプト</h4>
                            <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono">
                                    {runDetails?.prompt || `# ${report.agent.name} Analysis

## Task
Analyze the latest news and trends related to the configured topics.

## Output Format
Generate a comprehensive report with:
- Executive summary
- Key topics and background analysis
- Strategic insights and recommended actions
- SNS/social media trends
- Source citations

## Configuration
Agent Type: ${report.agent.type || "news"}
Generated: ${new Date(report.createdAt).toISOString()}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Output View (通常のレポートコンテンツ) */}
            {viewMode === "output" && (
                <div className="flex gap-8">
                    {/* メインコンテンツ */}
                    <article className="flex-1 max-w-4xl">
                        {/* タイトルセクション */}
                        <div className="mb-8 pb-6 border-b border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                {/* ステータスドロップダウン */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                                        disabled={isUpdating}
                                        className={`${currentStatus.color} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity`}
                                    >
                                        {currentStatus.label}
                                        <ChevronDown size={14} />
                                    </button>
                                    {isStatusOpen && (
                                        <div className="absolute left-0 top-9 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 w-40">
                                            {statusOptions.map((option) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => updateStatus(option.id)}
                                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${option.id === status ? "bg-slate-50" : ""
                                                        }`}
                                                >
                                                    {option.id === status && <Check size={14} />}
                                                    <span className={option.id === status ? "font-medium" : ""}>{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="flex items-center gap-1 text-sm text-slate-500">
                                    <Newspaper size={14} />
                                    {report.agent.name}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{report.title}</h1>
                            <p className="text-slate-500">
                                {new Date(report.createdAt).toLocaleDateString("ja-JP", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}付 レポート
                            </p>
                        </div>

                        {/* エグゼクティブ・サマリー */}
                        {content.summary && (
                            <section id="summary" className="mb-10">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">エグゼクティブ・サマリー</h2>
                                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border-l-4 border-emerald-500">
                                    {content.summary}
                                </p>
                            </section>
                        )}

                        {/* 主要トピックと背景分析 */}
                        {content.topics && content.topics.length > 0 && (
                            <section id="topics" className="mb-10">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">主要トピックと背景分析</h2>
                                <div className="space-y-6">
                                    {content.topics.map((topic, i) => (
                                        <div key={i} className="card p-5">
                                            <h3 className="font-bold text-slate-800 mb-2">{topic.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">{topic.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 戦略的インサイトと推奨アクション */}
                        {content.insights && content.insights.length > 0 && (
                            <section id="insights" className="mb-10">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">戦略的インサイトと推奨アクション</h2>

                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100">
                                                <th className="text-left p-3 font-semibold text-slate-700 border border-slate-200">重点領域</th>
                                                <th className="text-left p-3 font-semibold text-slate-700 border border-slate-200">MORODAS戦略</th>
                                                <th className="text-left p-3 font-semibold text-slate-700 border border-slate-200">期待効果</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {content.insights.map((insight, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="p-3 border border-slate-200 font-medium">{insight.area}</td>
                                                    <td className="p-3 border border-slate-200">{insight.strategy}</td>
                                                    <td className="p-3 border border-slate-200">{insight.expected}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {content.recommendedActions && content.recommendedActions.length > 0 && (
                                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                        <h4 className="font-bold text-emerald-800 mb-2">今後の推奨アクション</h4>
                                        <ul className="space-y-2">
                                            {content.recommendedActions.map((action, i) => (
                                                <li key={i} className="flex items-center justify-between text-emerald-700">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-emerald-500 font-bold">•</span>
                                                        {action}
                                                    </div>
                                                    <button
                                                        onClick={() => addToTasks(action)}
                                                        className="text-xs text-emerald-600 hover:text-emerald-800 underline"
                                                    >
                                                        タスクに追加
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* SNS・ニュース動向 */}
                        {content.sns && content.sns.length > 0 && (
                            <section id="sns" className="mb-10">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">SNS・ニュース動向 (X/Twitter)</h2>
                                <div className="space-y-4">
                                    {content.sns.map((post, i) => (
                                        <div key={i} className="card p-4 border-l-4 border-blue-400">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex-center">
                                                    <span className="text-xs font-bold">X</span>
                                                </div>
                                                <span className="font-semibold text-slate-800">{post.author}</span>
                                            </div>
                                            <p className="text-slate-700 mb-3">{post.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp size={14} /> {post.likes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Repeat2 size={14} /> {post.retweets}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle size={14} /> {post.replies}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 情報ソース */}
                        {content.sources && content.sources.length > 0 && (
                            <section id="sources" className="mb-10">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">情報ソース ({content.sources.length})</h2>
                                <div className="flex flex-wrap gap-3">
                                    {content.sources.map((source, i) => (
                                        <a
                                            key={i}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                                        >
                                            <LinkIcon size={14} />
                                            {source.name}
                                            <ExternalLink size={12} />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </article>

                    {/* 右サイドバー（目次） */}
                    <aside className="hidden xl:block w-64 shrink-0">
                        <div className="sticky top-8">
                            <h3 className="font-bold text-slate-700 mb-4">目次</h3>
                            <nav className="space-y-2">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="block text-sm text-slate-500 hover:text-emerald-600 transition-colors py-1 border-l-2 border-transparent hover:border-emerald-500 pl-3"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}
