"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Target,
    ArrowUpRight,
    Clock,
    X,
    Edit2,
    Sun,
    CheckCircle2,
} from "lucide-react";
import type { Alert, Task, Agent, Metric, MonthlyRevenue } from "@/types";
import TaskItem from "./TaskItem";
import AgentStatusCard from "./AgentStatusCard";
import N8nStatusPanel from "./N8nStatusPanel";

interface DashboardClientProps {
    initialAlerts: Alert[];
    initialTasks: Task[];
    agents: Agent[];
    metricsMap: Record<string, Metric>;
    monthlyRevenue: MonthlyRevenue | null;
}

export default function DashboardClient({
    initialAlerts,
    initialTasks,
    agents,
    metricsMap,
    monthlyRevenue,
}: DashboardClientProps) {
    const router = useRouter();
    const [alerts, setAlerts] = useState(initialAlerts);
    const [tasks, setTasks] = useState(initialTasks);
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
    const [editingMetric, setEditingMetric] = useState<string | null>(null);
    const [metricValue, setMetricValue] = useState("");
    const [briefing, setBriefing] = useState<string | null>(null);
    const [briefingLoading, setBriefingLoading] = useState(true);

    const xFollowers = metricsMap["x_followers"];
    const notePv = metricsMap["note_weekly_pv"];
    const stagnantCount = alerts.filter((a) => a.type === "stagnation").length;

    // 毎朝ブリーフィングを取得
    useEffect(() => {
        async function fetchBriefing() {
            try {
                const res = await fetch("/api/dashboard/briefing");
                const data = await res.json();
                setBriefing(data.briefing || null);
            } catch {
                setBriefing(null);
            } finally {
                setBriefingLoading(false);
            }
        }
        fetchBriefing();
    }, []);

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

    // タスクを開始
    const startTask = async (taskId: string) => {
        try {
            await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: "in_progress" }),
            });
            setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: "in_progress" } : t)));
        } catch (error) {
            console.error("Failed to start task:", error);
        }
    };

    // タスクを完了
    const completeTask = async (taskId: string) => {
        try {
            await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId, status: "done" }),
            });
            setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: "done" } : t)));
        } catch (error) {
            console.error("Failed to complete task:", error);
        }
    };

    // メトリクス更新
    const updateMetric = async (metricName: string) => {
        if (!metricValue) return;
        try {
            await fetch("/api/metrics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    metrics: [{ name: metricName, value: parseInt(metricValue), target: metricsMap[metricName]?.target }],
                }),
            });
            setEditingMetric(null);
            setMetricValue("");
            router.refresh();
        } catch (error) {
            console.error("Failed to update metric:", error);
        }
    };

    return (
        <div className="animate-in">
            {/* ヘッダー */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="section-header">ダッシュボード</h1>
                    <p className="section-subheader">MORODAS OSの全体状況を一目で確認できます。</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                    <Clock size={16} />
                    <span>{new Date().toLocaleString("ja-JP")}</span>
                </div>
            </div>

            {/* アラートセクション */}
            {stagnantCount > 0 && (
                <div className="alert-box mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex-center">
                            <AlertTriangle className="text-red-600" size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-red-800">⚠️ 停滞検知: {stagnantCount}件のタスクが停止中</p>
                            <p className="text-sm text-red-600">
                                {alerts.filter((a) => a.type === "stagnation").map((a) => a.title).join(" / ")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => alerts.filter((a) => a.type === "stagnation").forEach((a) => dismissAlert(a.id))}
                            className="text-red-600 hover:text-red-800 text-sm"
                        >
                            すべて確認済み
                        </button>
                        <Link href="/feed" className="btn-primary bg-red-600 hover:bg-red-700">
                            確認する
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            )}

            {/* ☀️ 毎朝ブリーフィング */}
            <div className="card p-6 mb-6 border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex-center">
                        <Sun className="text-amber-600" size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">今日のブリーフィング</h3>
                </div>
                {briefingLoading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-amber-200/50 rounded w-full" />
                        <div className="h-4 bg-amber-200/50 rounded w-5/6" />
                        <div className="h-4 bg-amber-200/50 rounded w-4/6" />
                    </div>
                ) : briefing ? (
                    <p className="text-sidebar-hover leading-relaxed whitespace-pre-line">{briefing}</p>
                ) : (
                    <p className="text-surface-500">ブリーフィングを生成できませんでした。</p>
                )}
            </div>

            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 収益トラッキング */}
                <div className="card p-6 border-l-4 border-primary-500 cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex-center">
                            <DollarSign className="text-primary-600" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                            {new Date().getFullYear()}年{new Date().getMonth() + 1}月
                        </span>
                    </div>
                    <p className="text-sm text-muted mb-1">今月の収益</p>
                    <p className="text-3xl font-bold text-foreground">
                        ¥{(monthlyRevenue?.totalRevenue || 0).toLocaleString()}
                    </p>
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted mb-1">
                            <span>目標: ¥{(monthlyRevenue?.targetRevenue || 1000000).toLocaleString()}</span>
                            <span>{Math.round(((monthlyRevenue?.totalRevenue || 0) / (monthlyRevenue?.targetRevenue || 1000000)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-surface-200 rounded-full h-2">
                            <div
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${Math.min(100, ((monthlyRevenue?.totalRevenue || 0) / (monthlyRevenue?.targetRevenue || 1000000)) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Xフォロワー */}
                <div
                    className="card p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow relative"
                    onClick={() => {
                        setEditingMetric("x_followers");
                        setMetricValue(xFollowers?.value?.toString() || "");
                    }}
                >
                    {editingMetric === "x_followers" && (
                        <div className="absolute inset-0 bg-white rounded-xl p-4 z-10 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold">Xフォロワー数を更新</span>
                                <button onClick={(e) => { e.stopPropagation(); setEditingMetric(null); }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <input
                                type="number"
                                value={metricValue}
                                onChange={(e) => setMetricValue(e.target.value)}
                                className="border border-surface-300 rounded-lg px-3 py-2 mb-4"
                                placeholder="現在のフォロワー数"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); updateMetric("x_followers"); }}
                                className="btn-primary"
                            >
                                保存
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex-center">
                            <TrendingUp className="text-blue-600" size={20} />
                        </div>
                        <div className="flex items-center gap-2">
                            {xFollowers?.change && (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full flex items-center gap-1">
                                    <ArrowUpRight size={12} /> +{xFollowers.change}
                                </span>
                            )}
                            <Edit2 size={14} className="text-muted" />
                        </div>
                    </div>
                    <p className="text-sm text-muted mb-1">Xフォロワー</p>
                    <p className="text-3xl font-bold text-foreground">{xFollowers?.value || 0}</p>
                    <p className="text-xs text-muted mt-2">目標: {xFollowers?.target?.toLocaleString() || "10,000"}</p>
                </div>

                {/* Note PV */}
                <div
                    className="card p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow relative"
                    onClick={() => {
                        setEditingMetric("note_weekly_pv");
                        setMetricValue(notePv?.value?.toString() || "");
                    }}
                >
                    {editingMetric === "note_weekly_pv" && (
                        <div className="absolute inset-0 bg-white rounded-xl p-4 z-10 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold">Note週間PVを更新</span>
                                <button onClick={(e) => { e.stopPropagation(); setEditingMetric(null); }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <input
                                type="number"
                                value={metricValue}
                                onChange={(e) => setMetricValue(e.target.value)}
                                className="border border-surface-300 rounded-lg px-3 py-2 mb-4"
                                placeholder="今週のPV"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); updateMetric("note_weekly_pv"); }}
                                className="btn-primary"
                            >
                                保存
                            </button>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex-center">
                            <Target className="text-purple-600" size={20} />
                        </div>
                        <div className="flex items-center gap-2">
                            {notePv?.changePercent && (
                                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full flex items-center gap-1">
                                    <ArrowUpRight size={12} /> +{notePv.changePercent.toFixed(0)}%
                                </span>
                            )}
                            <Edit2 size={14} className="text-muted" />
                        </div>
                    </div>
                    <p className="text-sm text-muted mb-1">Note 週間PV</p>
                    <p className="text-3xl font-bold text-foreground">{notePv?.value || 0}</p>
                    <p className="text-xs text-muted mt-2">先週: {(notePv?.value || 0) - (notePv?.change || 0)}</p>
                </div>

                {/* 停滞タスク */}
                <div className="card p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg ${stagnantCount > 0 ? "bg-red-100" : "bg-green-100"} flex-center`}>
                            {stagnantCount > 0 ? (
                                <AlertTriangle className="text-red-600" size={20} />
                            ) : (
                                <CheckCircle2 className="text-green-600" size={20} />
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-muted mb-1">停滞タスク</p>
                    <p className={`text-3xl font-bold ${stagnantCount > 0 ? "text-red-600" : "text-green-600"}`}>
                        {stagnantCount > 0 ? `${stagnantCount}件` : "✅ なし"}
                    </p>
                    <p className="text-xs text-muted mt-2">2日以上更新なしで検知</p>
                </div>

            </div>

            {/* 2カラムレイアウト */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 今日の優先タスク */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                            今日の優先タスク
                        </h3>
                        <Link href="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
                            すべて見る →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {tasks.filter((t) => t.status !== "done").map((task) => (
                            <TaskItem
                                key={task.id}
                                priority={task.priority as "high" | "medium" | "low"}
                                title={task.title}
                                time={task.estimatedMinutes ? `${task.estimatedMinutes}分` : "--"}
                                agent={task.agentType || "手動"}
                                status={task.status as "pending" | "in_progress" | "done"}
                                onStart={() => startTask(task.id)}
                                onComplete={() => completeTask(task.id)}
                            />
                        ))}
                        {tasks.filter((t) => t.status !== "done").length === 0 && (
                            <p className="text-surface-500 text-sm py-4 text-center">タスクがありません 🎉</p>
                        )}
                    </div>

                    {tasks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-surface-100 text-sm text-muted">
                            推定作業時間: <span className="font-semibold text-sidebar-hover">
                                {tasks.filter((t) => t.status !== "done").reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0)}分
                            </span>
                        </div>
                    )}
                </div>

                {/* エージェント稼働状況 */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-foreground">エージェント稼働状況</h3>
                        <Link href="/agents" className="text-sm text-primary-600 hover:text-primary-700">
                            管理画面 →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {agents.map((agent) => (
                            <AgentStatusCard
                                key={agent.id}
                                name={agent.name}
                                lastRun={agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) : "--"}
                                status={agent.enabled ? "active" : "stopped"}
                                outputs={agent._count?.reports || 0}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* n8nワークフロー稼働状況 */}
            <N8nStatusPanel />
        </div>
    );
}

