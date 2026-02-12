"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Workflow,
    Power,
    PowerOff,
    Play,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    ExternalLink,
} from "lucide-react";

interface WorkflowStatus {
    id: string;
    name: string;
    category: string;
    active?: boolean;
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

const STATUS_ICONS: Record<string, React.ReactNode> = {
    success: <CheckCircle size={14} style={{ color: "#22c55e" }} />,
    error: <XCircle size={14} style={{ color: "#ef4444" }} />,
    running: <Loader2 size={14} className="animate-spin" style={{ color: "#3b82f6" }} />,
    waiting: <Clock size={14} style={{ color: "#f59e0b" }} />,
    canceled: <XCircle size={14} style={{ color: "#6b7280" }} />,
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "今";
    if (mins < 60) return `${mins}分前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    return `${days}日前`;
}

export default function N8nWorkflowPanel() {
    const [data, setData] = useState<N8nData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/n8n");
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("n8n fetch error:", err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleAction = async (workflowId: string, action: "activate" | "deactivate" | "execute") => {
        setActionLoading(`${workflowId}-${action}`);
        try {
            const res = await fetch(`/api/n8n/${workflowId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Action failed");
            // Refresh data after action
            await fetchData();
        } catch (err) {
            console.error("Action error:", err);
        }
        setActionLoading(null);
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ padding: 60 }}>
                <Loader2 size={28} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>
                n8nへの接続に失敗しました
            </div>
        );
    }

    const allWorkflows = Object.values(data.categories).flat();

    return (
        <div>
            {/* Summary bar */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                marginBottom: 20,
            }}>
                {[
                    { label: "ワークフロー数", value: data.summary.totalWorkflows, color: "var(--text)" },
                    { label: "有効", value: data.summary.activeWorkflows, color: "#22c55e" },
                    { label: "24h実行数", value: data.summary.totalExecutions24h, color: "var(--primary)" },
                    { label: "24hエラー", value: data.summary.errorCount24h, color: data.summary.errorCount24h > 0 ? "#ef4444" : "var(--text-muted)" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        padding: "14px 16px",
                        background: "var(--color-surface-100)",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                    }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Workflow list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {allWorkflows.map((wf) => {
                    const isActive = wf.active;
                    return (
                        <div
                            key={wf.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "12px 16px",
                                background: "var(--color-surface-100)",
                                borderRadius: 10,
                                border: "1px solid var(--border)",
                                transition: "all 0.15s",
                            }}
                        >
                            {/* Status dot */}
                            <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: isActive ? "#22c55e" : "#6b7280",
                                flexShrink: 0,
                            }} />

                            {/* Name & category */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: "var(--text)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}>
                                    {wf.name}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                                    <span style={{
                                        fontSize: 11,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                        background: "var(--color-surface-200)",
                                        color: "var(--text-muted)",
                                    }}>
                                        {wf.category}
                                    </span>
                                    {wf.lastExecution && (
                                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
                                            {STATUS_ICONS[wf.lastExecution.status]}
                                            {timeAgo(wf.lastExecution.startedAt)}
                                        </span>
                                    )}
                                    {wf.stats24h.total > 0 && (
                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                            24h: {wf.stats24h.success}/{wf.stats24h.total}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                {/* Toggle active */}
                                <button
                                    onClick={() => handleAction(wf.id, isActive ? "deactivate" : "activate")}
                                    disabled={actionLoading === `${wf.id}-activate` || actionLoading === `${wf.id}-deactivate`}
                                    title={isActive ? "無効化" : "有効化"}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        border: "1px solid var(--border)",
                                        background: isActive ? "rgba(34, 197, 94, 0.1)" : "var(--color-surface-200)",
                                        color: isActive ? "#22c55e" : "var(--text-muted)",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {(actionLoading === `${wf.id}-activate` || actionLoading === `${wf.id}-deactivate`)
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : isActive ? <Power size={14} /> : <PowerOff size={14} />
                                    }
                                </button>

                                {/* Execute */}
                                <button
                                    onClick={() => handleAction(wf.id, "execute")}
                                    disabled={actionLoading === `${wf.id}-execute`}
                                    title="手動実行"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        border: "1px solid var(--border)",
                                        background: "var(--color-surface-200)",
                                        color: "var(--primary)",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {actionLoading === `${wf.id}-execute`
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Play size={14} />
                                    }
                                </button>

                                {/* Open in n8n */}
                                <a
                                    href={`http://133.18.124.53:5678/workflow/${wf.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="n8nで開く"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        border: "1px solid var(--border)",
                                        background: "var(--color-surface-200)",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Refresh button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button
                    onClick={() => { setLoading(true); fetchData(); }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        fontSize: 12,
                        color: "var(--text-muted)",
                        background: "none",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        cursor: "pointer",
                    }}
                >
                    <RefreshCw size={12} />
                    更新
                </button>
            </div>
        </div>
    );
}
