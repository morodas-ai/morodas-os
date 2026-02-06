"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    AlertTriangle,
    DollarSign,
    Target,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Building2,
    X,
    Edit2
} from "lucide-react";

interface Alert {
    id: string;
    title: string;
    message: string;
    type: string;
    severity: string;
}

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    estimatedMinutes: number | null;
    agentType: string | null;
}

interface Agent {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    lastRunAt: string | null;
    _count: { reports: number };
}

interface Metric {
    name: string;
    value: number;
    change: number | null;
    changePercent: number | null;
    target: number | null;
}

interface MonthlyRevenue {
    totalRevenue: number;
    targetRevenue: number;
}

interface DashboardClientProps {
    initialAlerts: Alert[];
    initialTasks: Task[];
    agents: Agent[];
    metricsMap: Record<string, Metric>;
    monthlyRevenue: MonthlyRevenue | null;
    daysToIncorporation: number | null;
}

export default function DashboardClient({
    initialAlerts,
    initialTasks,
    agents,
    metricsMap,
    monthlyRevenue,
    daysToIncorporation,
}: DashboardClientProps) {
    const router = useRouter();
    const [alerts, setAlerts] = useState(initialAlerts);
    const [tasks, setTasks] = useState(initialTasks);
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
    const [editingMetric, setEditingMetric] = useState<string | null>(null);
    const [metricValue, setMetricValue] = useState("");

    const xFollowers = metricsMap["x_followers"];
    const notePv = metricsMap["note_weekly_pv"];
    const stagnantCount = alerts.filter((a) => a.type === "stagnation").length;

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

            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 収益トラッキング */}
                <div className="card p-6 border-l-4 border-emerald-500 cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex-center">
                            <DollarSign className="text-emerald-600" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                            {new Date().getFullYear()}年{new Date().getMonth() + 1}月
                        </span>
                    </div>
                    <p className="text-sm text-muted mb-1">今月の収益</p>
                    <p className="text-3xl font-bold text-slate-900">
                        ¥{(monthlyRevenue?.totalRevenue || 0).toLocaleString()}
                    </p>
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted mb-1">
                            <span>目標: ¥{(monthlyRevenue?.targetRevenue || 1000000).toLocaleString()}</span>
                            <span>{Math.round(((monthlyRevenue?.totalRevenue || 0) / (monthlyRevenue?.targetRevenue || 1000000)) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full"
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
                                className="border border-slate-300 rounded-lg px-3 py-2 mb-4"
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
                            <Edit2 size={14} className="text-slate-400" />
                        </div>
                    </div>
                    <p className="text-sm text-muted mb-1">Xフォロワー</p>
                    <p className="text-3xl font-bold text-slate-900">{xFollowers?.value || 0}</p>
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
                                className="border border-slate-300 rounded-lg px-3 py-2 mb-4"
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
                            <Edit2 size={14} className="text-slate-400" />
                        </div>
                    </div>
                    <p className="text-sm text-muted mb-1">Note 週間PV</p>
                    <p className="text-3xl font-bold text-slate-900">{notePv?.value || 0}</p>
                    <p className="text-xs text-muted mt-2">先週: {(notePv?.value || 0) - (notePv?.change || 0)}</p>
                </div>

                {/* 法人化カウントダウン */}
                <div className="card p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex-center">
                            <Building2 className="text-orange-600" size={20} />
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            2026年4月
                        </span>
                    </div>
                    <p className="text-sm text-muted mb-1">法人設立まで</p>
                    <p className="text-3xl font-bold text-slate-900">{daysToIncorporation || "--"}日</p>
                    <p className="text-xs text-muted mt-2">次のタスク: 定款作成</p>
                </div>
            </div>

            {/* 2カラムレイアウト */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 今日の優先タスク */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            今日の優先タスク
                        </h3>
                        <Link href="/tasks" className="text-sm text-emerald-600 hover:text-emerald-700">
                            すべて見る →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {tasks.filter((t) => t.status !== "done").map((task) => (
                            <TaskItem
                                key={task.id}
                                id={task.id}
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
                            <p className="text-slate-500 text-sm py-4 text-center">タスクがありません 🎉</p>
                        )}
                    </div>

                    {tasks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-muted">
                            推定作業時間: <span className="font-semibold text-slate-700">
                                {tasks.filter((t) => t.status !== "done").reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0)}分
                            </span>
                        </div>
                    )}
                </div>

                {/* エージェント稼働状況 */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-900">エージェント稼働状況</h3>
                        <Link href="/agents" className="text-sm text-emerald-600 hover:text-emerald-700">
                            管理画面 →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {agents.map((agent) => (
                            <AgentStatus
                                key={agent.id}
                                name={agent.name}
                                lastRun={agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) : "--"}
                                status={agent.enabled ? "active" : "stopped"}
                                outputs={agent._count.reports}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TaskItem({ id, priority, title, time, agent, status, onStart, onComplete }: {
    id: string;
    priority: "high" | "medium" | "low";
    title: string;
    time: string;
    agent: string;
    status: "pending" | "in_progress" | "done";
    onStart: () => void;
    onComplete: () => void;
}) {
    const priorityColor = priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-yellow-500" : "bg-green-500";

    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg ${status === "done" ? "bg-slate-50" : "bg-white border border-slate-200 hover:border-emerald-300"} transition-colors`}>
            <div className={`w-2 h-2 rounded-full ${status === "done" ? "bg-slate-300" : priorityColor}`} />
            <div className="flex-1">
                <p className={`font-medium ${status === "done" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {title}
                </p>
                <p className="text-xs text-muted flex items-center gap-2">
                    <span>{time}</span>
                    <span>•</span>
                    <span>{agent}</span>
                </p>
            </div>
            {status === "done" ? (
                <CheckCircle2 size={20} className="text-emerald-500" />
            ) : status === "in_progress" ? (
                <button onClick={onComplete} className="btn-primary text-sm py-1.5 px-3 bg-emerald-600">完了</button>
            ) : (
                <button onClick={onStart} className="btn-primary text-sm py-1.5 px-3">開始</button>
            )}
        </div>
    );
}

function AgentStatus({ name, lastRun, status, outputs }: {
    name: string;
    lastRun: string;
    status: "active" | "stopped";
    outputs: number;
}) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="font-medium text-slate-700">{name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
                <span>最終実行: {lastRun}</span>
                <span className="bg-slate-200 px-2 py-0.5 rounded text-xs">{outputs}件</span>
            </div>
        </div>
    );
}
