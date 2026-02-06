"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowRight,
    Clock,
    Newspaper,
    TrendingUp,
    Users,
    Search,
    BarChart3,
    Target,
    MessageCircle,
    MoreHorizontal,
    Archive,
    Trash2,
    Check
} from "lucide-react";

// エージェントタイプの定義
const agentIcons: Record<string, { icon: typeof Newspaper; color: string; label: string }> = {
    news: { icon: Newspaper, label: "News Agent", color: "text-blue-600" },
    social: { icon: MessageCircle, label: "Social Listening Agent", color: "text-purple-600" },
    competitor: { icon: Users, label: "Competitor Analysis Agent", color: "text-orange-600" },
    growth: { icon: TrendingUp, label: "Growth Metrics Agent", color: "text-green-600" },
    geo: { icon: Target, label: "GEO Agent", color: "text-cyan-600" },
    seo: { icon: Search, label: "SEO Agent", color: "text-indigo-600" },
    socialmedia: { icon: BarChart3, label: "Social Media Agent", color: "text-pink-600" },
};

// ステータスフィルター
const statusFilters = [
    { id: "all", label: "すべて" },
    { id: "review", label: "レビュー必要" },
    { id: "processing", label: "処理中" },
    { id: "done", label: "完了" },
    { id: "archived", label: "アーカイブ済み" },
];

// ステータスバッジのスタイル
const statusStyles: Record<string, string> = {
    review: "badge-review",
    processing: "badge-processing",
    done: "badge-done",
    archived: "bg-slate-100 text-slate-600",
};

const statusLabels: Record<string, string> = {
    review: "レビュー必要",
    processing: "処理中",
    done: "完了",
    archived: "アーカイブ済み",
};

interface Report {
    id: string;
    title: string;
    description: string;
    status: string;
    workspace: string;
    createdAt: string;
    agent: {
        id: string;
        name: string;
        type: string;
    };
}

interface Alert {
    id: string;
    title: string;
    message: string;
    type: string;
    severity: string;
}

interface FeedClientProps {
    initialReports: Report[];
    initialAlerts: Alert[];
}

export default function FeedClient({ initialReports, initialAlerts }: FeedClientProps) {
    const router = useRouter();
    const [reports, setReports] = useState(initialReports);
    const [alerts, setAlerts] = useState(initialAlerts);
    const [statusFilter, setStatusFilter] = useState("all");
    const [agentFilter, setAgentFilter] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const mainAlert = alerts[0];

    // フィルタリング
    const filteredReports = reports.filter((report) => {
        const matchesStatus = statusFilter === "all" || report.status === statusFilter;
        const matchesAgent = !agentFilter || report.agent.type === agentFilter;
        return matchesStatus && matchesAgent;
    });

    // アラートを非表示
    const dismissAlert = async (alertId: string) => {
        try {
            await fetch("/api/alerts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: alertId, isDismissed: true }),
            });
            setAlerts(alerts.filter((a) => a.id !== alertId));
        } catch (error) {
            console.error("Failed to dismiss alert:", error);
        }
    };

    // レポートステータス変更
    const updateReportStatus = async (reportId: string, newStatus: string) => {
        try {
            await fetch(`/api/reports/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setReports(reports.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)));
            setOpenMenuId(null);
        } catch (error) {
            console.error("Failed to update report:", error);
        }
    };

    return (
        <div className="animate-in">
            {/* アラートセクション（オジキ専用：停滞検知） */}
            {mainAlert && (
                <div className="alert-box mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex-center">
                            <AlertTriangle className="text-red-600" size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-red-800">停滞検知: {mainAlert.title}</p>
                            <p className="text-sm text-red-600">{mainAlert.message}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => dismissAlert(mainAlert.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                        >
                            非表示
                        </button>
                        <button className="btn-primary bg-red-600 hover:bg-red-700">
                            再開する
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ヘッダー */}
            <div className="mb-6">
                <h1 className="section-header">フィード</h1>
                <p className="section-subheader">AIエージェントが実行中のタスクを確認できます。</p>
            </div>

            {/* フィルター */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted">ステータス:</span>
                    <div className="flex gap-2">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setStatusFilter(filter.id)}
                                className={`filter-pill ${statusFilter === filter.id ? "active" : ""}`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted">エージェントタイプ:</span>
                    <select
                        className="filter-pill"
                        value={agentFilter}
                        onChange={(e) => setAgentFilter(e.target.value)}
                    >
                        <option value="">すべて</option>
                        {Object.entries(agentIcons).map(([type, { label }]) => (
                            <option key={type} value={type}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* フィードカード（3カラムグリッド） */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => {
                    const agentInfo = agentIcons[report.agent.type] || agentIcons.news;
                    const AgentIcon = agentInfo.icon;

                    return (
                        <div key={report.id} className="card p-5 flex flex-col relative">
                            {/* ステータスバッジ */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={statusStyles[report.status] || "badge-review"}>
                                    {statusLabels[report.status] || "レビュー必要"}
                                </span>
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                                        className="text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                    {openMenuId === report.id && (
                                        <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 w-40">
                                            <button
                                                onClick={() => updateReportStatus(report.id, "done")}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <Check size={14} /> 完了にする
                                            </button>
                                            <button
                                                onClick={() => updateReportStatus(report.id, "archived")}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <Archive size={14} /> アーカイブ
                                            </button>
                                            <button
                                                onClick={() => updateReportStatus(report.id, "review")}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600"
                                            >
                                                <Trash2 size={14} /> 削除
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* エージェント情報 */}
                            <div className="flex items-center gap-2 mb-2">
                                <AgentIcon size={16} className={agentInfo.color} />
                                <span className="text-sm font-medium text-slate-600">{report.agent.name}</span>
                            </div>

                            {/* タイトル */}
                            <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                                {report.title}
                            </h3>

                            {/* ワークスペース */}
                            <p className="text-xs text-slate-400 mb-3">{report.workspace}</p>

                            {/* 説明文 */}
                            <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                                {report.description}
                            </p>

                            {/* フッター */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Clock size={14} />
                                    <span>{new Date(report.createdAt).toLocaleString("ja-JP")}</span>
                                </div>
                                <Link
                                    href={`/feed/${report.id}`}
                                    className="btn-primary text-sm py-2"
                                >
                                    結果を見る
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredReports.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p>該当するレポートがありません。</p>
                </div>
            )}
        </div>
    );
}
