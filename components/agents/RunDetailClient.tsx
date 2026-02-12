"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Activity,
    FileText,
    Terminal,
    AlertTriangle,
    Copy,
    Check,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import clsx from "clsx";

interface RunDetail {
    id: string;
    agentId: string;
    status: string;
    output: string;
    error: string | null;
    duration: number | null;
    prompt: string | null;
    createdAt: string;
    agent: {
        id: string;
        name: string;
        type: string;
    };
}

export default function RunDetailClient() {
    const params = useParams();
    const router = useRouter();
    const agentId = params.id as string;
    const runId = params.runId as string;

    const [run, setRun] = useState<RunDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        fetchRunDetail();
    }, [agentId, runId]);

    const fetchRunDetail = async () => {
        try {
            const res = await fetch(`/api/agents/${agentId}/runs/${runId}`);
            const data = await res.json();
            if (data.success) {
                setRun(data.data);
            } else {
                setError(data.error || "Run not found");
            }
        } catch (err) {
            console.error("Failed to fetch run detail:", err);
            setError("Failed to load run details");
        }
        setLoading(false);
    };

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            console.error("Failed to copy");
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "completed":
                return {
                    icon: CheckCircle2,
                    label: "完了",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                    badge: "bg-emerald-500/20 text-emerald-400",
                };
            case "failed":
                return {
                    icon: XCircle,
                    label: "失敗",
                    color: "text-red-400",
                    bg: "bg-red-500/10 border-red-500/20",
                    badge: "bg-red-500/20 text-red-400",
                };
            case "running":
                return {
                    icon: Loader2,
                    label: "実行中",
                    color: "text-amber-400",
                    bg: "bg-amber-500/10 border-amber-500/20",
                    badge: "bg-amber-500/20 text-amber-400",
                };
            default:
                return {
                    icon: Clock,
                    label: "待機中",
                    color: "text-surface-400",
                    bg: "bg-surface-500/10 border-surface-500/20",
                    badge: "bg-surface-500/20 text-surface-400",
                };
        }
    };

    const parseOutput = (outputStr: string): Record<string, unknown> | null => {
        try {
            const parsed = JSON.parse(outputStr);
            return typeof parsed === "object" ? parsed : null;
        } catch {
            return null;
        }
    };

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds}秒`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-surface-500">
                        <Loader2 size={28} className="animate-spin" />
                        <span>実行結果を読み込み中...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !run) {
        return (
            <div className="max-w-4xl mx-auto">
                <Link
                    href={`/agents/${agentId}`}
                    className="flex items-center text-muted hover:text-primary-500 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    エージェントに戻る
                </Link>
                <div className="h-64 flex items-center justify-center text-surface-500">
                    <AlertTriangle size={20} className="mr-2" />
                    {error || "実行結果が見つかりません"}
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(run.status);
    const StatusIcon = statusConfig.icon;
    const parsedOutput = parseOutput(run.output);

    return (
        <div className="max-w-4xl mx-auto">
            {/* ナビゲーション */}
            <Link
                href={`/agents/${agentId}`}
                className="flex items-center text-muted hover:text-primary-500 mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                {run.agent.name} に戻る
            </Link>

            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-3">
                        <Activity size={24} className="text-primary-500" />
                        実行結果の詳細
                    </h1>
                    <p className="text-muted mt-1">
                        {format(new Date(run.createdAt), "yyyy年M月d日 HH:mm:ss", { locale: ja })}
                    </p>
                </div>
                <span className={clsx("px-3 py-1.5 rounded-full text-sm font-medium", statusConfig.badge)}>
                    <StatusIcon
                        size={14}
                        className={clsx("inline mr-1.5", run.status === "running" && "animate-spin")}
                    />
                    {statusConfig.label}
                </span>
            </div>

            {/* サマリーカード */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-sidebar/50 border border-sidebar-hover rounded-xl p-4">
                    <p className="text-xs text-muted mb-1">エージェント</p>
                    <p className="text-sm font-medium text-surface-100">{run.agent.name}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{run.agent.type}</p>
                </div>
                <div className="bg-sidebar/50 border border-sidebar-hover rounded-xl p-4">
                    <p className="text-xs text-muted mb-1">実行時間</p>
                    <p className="text-sm font-medium text-surface-100">
                        {run.duration !== null ? formatDuration(run.duration) : "—"}
                    </p>
                </div>
                <div className="bg-sidebar/50 border border-sidebar-hover rounded-xl p-4">
                    <p className="text-xs text-muted mb-1">Run ID</p>
                    <p className="text-xs font-mono text-surface-300 truncate" title={run.id}>
                        {run.id}
                    </p>
                </div>
            </div>

            {/* プロンプト */}
            {run.prompt && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                            <FileText size={18} className="text-primary-400" />
                            使用プロンプト
                        </h2>
                        <button
                            onClick={() => copyToClipboard(run.prompt!, "prompt")}
                            className="text-xs text-muted hover:text-primary-400 flex items-center gap-1 transition-colors"
                        >
                            {copiedField === "prompt" ? (
                                <><Check size={14} /> コピー済み</>
                            ) : (
                                <><Copy size={14} /> コピー</>
                            )}
                        </button>
                    </div>
                    <div className="bg-sidebar/50 border border-sidebar-hover rounded-xl p-4">
                        <pre className="text-sm text-surface-300 whitespace-pre-wrap font-sans leading-relaxed">
                            {run.prompt}
                        </pre>
                    </div>
                </div>
            )}

            {/* 出力 */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
                        <Terminal size={18} className="text-primary-400" />
                        出力データ
                    </h2>
                    <button
                        onClick={() => copyToClipboard(run.output, "output")}
                        className="text-xs text-muted hover:text-primary-400 flex items-center gap-1 transition-colors"
                    >
                        {copiedField === "output" ? (
                            <><Check size={14} /> コピー済み</>
                        ) : (
                            <><Copy size={14} /> コピー</>
                        )}
                    </button>
                </div>
                <div className="bg-sidebar/50 border border-sidebar-hover rounded-xl p-4 overflow-x-auto">
                    {parsedOutput ? (
                        <pre className="text-sm text-surface-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {JSON.stringify(parsedOutput, null, 2)}
                        </pre>
                    ) : (
                        <p className="text-sm text-surface-400">
                            {run.output === "{}" ? "出力なし" : run.output}
                        </p>
                    )}
                </div>
            </div>

            {/* エラー */}
            {run.error && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} />
                        エラー詳細
                    </h2>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                        <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono leading-relaxed">
                            {run.error}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
