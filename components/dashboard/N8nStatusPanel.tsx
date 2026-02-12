"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    Zap,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

interface WorkflowStatus {
    id: string;
    name: string;
    category: string;
    lastExecution: {
        status: "success" | "error" | "running" | "waiting" | "canceled";
        startedAt: string;
        stoppedAt: string | null;
        durationMs: number | null;
    } | null;
    stats24h: {
        total: number;
        success: number;
        error: number;
        successRate: number;
    };
}

interface N8nData {
    summary: {
        totalWorkflows: number;
        activeWorkflows: number;
        totalExecutions24h: number;
        errorCount24h: number;
        overallSuccessRate: number;
    };
    categories: Record<string, WorkflowStatus[]>;
}

function StatusIcon({ status }: { status: string }) {
    switch (status) {
        case "success":
            return <CheckCircle2 size={16} className="text-green-600" />;
        case "error":
            return <XCircle size={16} className="text-red-500" />;
        case "running":
            return <Loader2 size={16} className="text-blue-500 animate-spin" />;
        default:
            return <Activity size={16} className="text-surface-300" />;
    }
}

function formatDuration(ms: number | null): string {
    if (ms === null) return "--";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m${Math.floor((ms % 60000) / 1000)}s`;
}

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "たった今";
    if (mins < 60) return `${mins}分前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}時間前`;
    return `${Math.floor(hours / 24)}日前`;
}

const categoryIcons: Record<string, string> = {
    "MORODAS": "🏭",
    "ニュース/AI": "📡",
    "予約": "📅",
    "CI/CD": "⚙️",
    "その他": "📦",
};

const categoryOrder = ["MORODAS", "ニュース/AI", "予約", "CI/CD", "その他"];

export default function N8nStatusPanel() {
    const [data, setData] = useState<N8nData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(["MORODAS", "ニュース/AI"])
    );
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/n8n");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setData(json);
            setError(null);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // 60秒ごとに自動更新
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="card p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex-center">
                        <Activity className="text-primary-600" size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">n8n ワークフロー稼働状況</h3>
                </div>
                <div className="space-y-3 animate-pulse">
                    <div className="h-12 bg-surface-100 rounded-lg" />
                    <div className="h-12 bg-surface-100 rounded-lg" />
                    <div className="h-12 bg-surface-100 rounded-lg" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-6 mt-6 border-l-4 border-red-400">
                <div className="flex items-center gap-3">
                    <XCircle className="text-red-500" size={20} />
                    <div>
                        <p className="font-bold text-foreground">n8n接続エラー</p>
                        <p className="text-sm text-muted">{error}</p>
                    </div>
                    <button onClick={handleRefresh} className="ml-auto btn-secondary text-sm px-3 py-1">
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { summary, categories } = data;

    return (
        <div className="card p-6 mt-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex-center">
                        <Zap className="text-primary-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">n8n ワークフロー稼働状況</h3>
                        <p className="text-xs text-muted">直近24時間の実行サマリー</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                    title="更新"
                >
                    <RefreshCw
                        size={16}
                        className={`text-muted ${refreshing ? "animate-spin" : ""}`}
                    />
                </button>
            </div>

            {/* サマリーカード */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <div className="bg-surface-50 rounded-lg p-3 border border-surface-200">
                    <p className="text-xs text-muted">稼働ワークフロー</p>
                    <p className="text-xl font-bold text-foreground">{summary.activeWorkflows}</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 border border-surface-200">
                    <p className="text-xs text-muted">24h実行回数</p>
                    <p className="text-xl font-bold text-foreground">{summary.totalExecutions24h}</p>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 border border-surface-200">
                    <p className="text-xs text-muted">成功率</p>
                    <p className={`text-xl font-bold ${summary.overallSuccessRate >= 90 ? "text-green-600" : summary.overallSuccessRate >= 70 ? "text-amber-600" : "text-red-600"}`}>
                        {summary.overallSuccessRate}%
                    </p>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 border border-surface-200">
                    <p className="text-xs text-muted">エラー件数</p>
                    <p className={`text-xl font-bold ${summary.errorCount24h > 0 ? "text-red-600" : "text-green-600"}`}>
                        {summary.errorCount24h > 0 ? summary.errorCount24h : "✅ 0"}
                    </p>
                </div>
            </div>

            {/* カテゴリ別ワークフロー */}
            <div className="space-y-2">
                {categoryOrder
                    .filter((cat) => categories[cat]?.length > 0)
                    .map((cat) => {
                        const workflows = categories[cat];
                        const isExpanded = expandedCategories.has(cat);
                        const catErrors = workflows.reduce(
                            (sum, w) => sum + w.stats24h.error,
                            0
                        );

                        return (
                            <div key={cat} className="border border-surface-200 rounded-lg overflow-hidden">
                                {/* カテゴリヘッダー */}
                                <button
                                    onClick={() => toggleCategory(cat)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        {isExpanded ? (
                                            <ChevronDown size={16} className="text-muted" />
                                        ) : (
                                            <ChevronRight size={16} className="text-muted" />
                                        )}
                                        <span className="text-sm">{categoryIcons[cat]}</span>
                                        <span className="font-semibold text-sm text-foreground">
                                            {cat}
                                        </span>
                                        <span className="text-xs text-muted">
                                            ({workflows.length})
                                        </span>
                                    </div>
                                    {catErrors > 0 && (
                                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                            {catErrors} error
                                        </span>
                                    )}
                                </button>

                                {/* ワークフロー一覧 */}
                                {isExpanded && (
                                    <div className="border-t border-surface-200">
                                        {workflows.map((wf) => (
                                            <div
                                                key={wf.id}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-b-0"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <StatusIcon
                                                        status={
                                                            wf.lastExecution?.status || "unknown"
                                                        }
                                                    />
                                                    <span className="text-sm text-foreground truncate">
                                                        {wf.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted shrink-0">
                                                    {wf.stats24h.total > 0 && (
                                                        <span
                                                            className={`font-medium ${wf.stats24h.successRate >= 90
                                                                    ? "text-green-600"
                                                                    : wf.stats24h.successRate >= 50
                                                                        ? "text-amber-600"
                                                                        : "text-red-600"
                                                                }`}
                                                        >
                                                            {wf.stats24h.success}/{wf.stats24h.total}
                                                        </span>
                                                    )}
                                                    {wf.lastExecution && (
                                                        <>
                                                            <span>
                                                                {formatDuration(
                                                                    wf.lastExecution.durationMs
                                                                )}
                                                            </span>
                                                            <span className="w-16 text-right">
                                                                {formatTimeAgo(
                                                                    wf.lastExecution.startedAt
                                                                )}
                                                            </span>
                                                        </>
                                                    )}
                                                    {!wf.lastExecution && (
                                                        <span className="text-surface-300">
                                                            未実行
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
