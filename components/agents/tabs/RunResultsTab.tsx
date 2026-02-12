"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import clsx from "clsx";

interface AgentRun {
    id: string;
    status: string;
    duration: number | null;
    error: string | null;
    createdAt: string;
    output: string;
}

interface RunResultsTabProps {
    agentId: string;
}

export default function RunResultsTab({ agentId }: RunResultsTabProps) {
    const [runs, setRuns] = useState<AgentRun[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRuns();
    }, [agentId]);

    const fetchRuns = async () => {
        try {
            const res = await fetch(`/api/agents/${agentId}/runs`);
            const data = await res.json();
            setRuns(data.data || []);
        } catch (error) {
            console.error("Failed to fetch runs:", error);
        }
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 size={20} className="text-primary-400" />;
            case "failed":
                return <XCircle size={20} className="text-red-400" />;
            case "running":
                return <Loader2 size={20} className="text-amber-400 animate-spin" />;
            default:
                return <Clock size={20} className="text-muted" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "completed":
                return "完了";
            case "failed":
                return "失敗";
            case "running":
                return "実行中";
            case "pending":
                return "待機中";
            default:
                return status;
        }
    };

    const getReportId = (output: string): string | null => {
        try {
            const parsed = JSON.parse(output);
            return parsed.reportId || null;
        } catch {
            return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary-400" size={24} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted mb-4">
                このエージェントの過去の実行結果を確認できます。
            </p>

            <div className="space-y-3">
                {runs.map((run) => {
                    const reportId = getReportId(run.output);

                    return (
                        <div
                            key={run.id}
                            className={clsx(
                                "p-4 rounded-xl border transition-all",
                                run.status === "completed"
                                    ? "bg-primary-500/5 border-primary-500/20"
                                    : run.status === "failed"
                                        ? "bg-red-500/5 border-red-500/20"
                                        : "bg-sidebar-hover/50 border-foreground"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getStatusIcon(run.status)}</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">
                                                {format(new Date(run.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}
                                            </span>
                                            <span className={clsx(
                                                "text-xs px-2 py-0.5 rounded-full",
                                                run.status === "completed"
                                                    ? "bg-primary-500/20 text-primary-400"
                                                    : run.status === "failed"
                                                        ? "bg-red-500/20 text-red-400"
                                                        : "bg-foreground text-surface-300"
                                            )}>
                                                {getStatusLabel(run.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted">
                                            {run.duration !== null && (
                                                <span>Duration: {run.duration}秒</span>
                                            )}
                                            {run.error && (
                                                <span className="text-red-400">{run.error}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {reportId && (
                                        <Link
                                            href={`/feed/${reportId}`}
                                            className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                                        >
                                            See results
                                            <ExternalLink size={14} />
                                        </Link>
                                    )}
                                    <Link
                                        href={`/agents/${agentId}/runs/${run.id}`}
                                        className="flex items-center gap-1 text-sm text-surface-400 hover:text-primary-400 transition-colors"
                                    >
                                        詳細を見る
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {runs.length === 0 && (
                <div className="text-center py-8 text-muted">
                    まだ実行履歴がありません
                </div>
            )}
        </div>
    );
}
