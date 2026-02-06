"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Loader2, Power, Trash2 } from "lucide-react";
import clsx from "clsx";

interface Trigger {
    id: string;
    name: string;
    type: string;
    frequency: string;
    dayOfWeek: number | null;
    dayOfMonth: number | null;
    hour: number;
    minute: number;
    timezone: string;
    enabled: boolean;
    nextFireAt: string | null;
}

interface TriggersTabProps {
    agentId: string;
}

const frequencyOptions = [
    { value: "daily", label: "毎日" },
    { value: "weekly", label: "毎週" },
    { value: "monthly", label: "毎月" },
];

const dayOfWeekLabels = ["日", "月", "火", "水", "木", "金", "土"];

export default function TriggersTab({ agentId }: TriggersTabProps) {
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // フォーム状態
    const [formData, setFormData] = useState({
        name: "",
        frequency: "weekly",
        dayOfWeek: 1,
        hour: 9,
        minute: 0,
    });

    useEffect(() => {
        fetchTriggers();
    }, [agentId]);

    const fetchTriggers = async () => {
        try {
            const res = await fetch(`/api/agents/${agentId}/triggers`);
            const data = await res.json();
            setTriggers(data.data || []);
        } catch (error) {
            console.error("Failed to fetch triggers:", error);
        }
        setLoading(false);
    };

    const createTrigger = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/agents/${agentId}/triggers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                await fetchTriggers();
                setShowForm(false);
                setFormData({ name: "", frequency: "weekly", dayOfWeek: 1, hour: 9, minute: 0 });
            }
        } catch (error) {
            console.error("Failed to create trigger:", error);
        }
        setSaving(false);
    };

    const toggleEnabled = async (triggerId: string, currentEnabled: boolean) => {
        try {
            const res = await fetch(`/api/agents/${agentId}/triggers`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ triggerId, enabled: !currentEnabled }),
            });
            if (res.ok) {
                setTriggers(prev =>
                    prev.map(t => (t.id === triggerId ? { ...t, enabled: !currentEnabled } : t))
                );
            }
        } catch (error) {
            console.error("Failed to toggle trigger:", error);
        }
    };

    const deleteTrigger = async (triggerId: string) => {
        if (!confirm("このトリガーを削除しますか？")) return;
        try {
            const res = await fetch(`/api/agents/${agentId}/triggers?triggerId=${triggerId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setTriggers(prev => prev.filter(t => t.id !== triggerId));
            }
        } catch (error) {
            console.error("Failed to delete trigger:", error);
        }
    };

    const formatSchedule = (trigger: Trigger) => {
        const time = `${String(trigger.hour).padStart(2, "0")}:${String(trigger.minute).padStart(2, "0")}`;
        if (trigger.frequency === "daily") {
            return `毎日 ${time}`;
        } else if (trigger.frequency === "weekly" && trigger.dayOfWeek !== null) {
            return `毎週${dayOfWeekLabels[trigger.dayOfWeek]}曜日 ${time}`;
        } else if (trigger.frequency === "monthly" && trigger.dayOfMonth !== null) {
            return `毎月${trigger.dayOfMonth}日 ${time}`;
        }
        return time;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-emerald-400" size={24} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                    エージェントの自動実行スケジュールを設定します。
                </p>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary text-sm px-3 py-1.5"
                >
                    <Plus size={16} />
                    追加
                </button>
            </div>

            {/* 新規作成フォーム */}
            {showForm && (
                <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 space-y-4">
                    <h4 className="font-medium text-white">新しいトリガー</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">名前</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="毎週月曜9時"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">頻度</label>
                            <select
                                value={formData.frequency}
                                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                            >
                                {frequencyOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {formData.frequency === "weekly" && (
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">曜日</label>
                            <select
                                value={formData.dayOfWeek}
                                onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                            >
                                {dayOfWeekLabels.map((label, index) => (
                                    <option key={index} value={index}>{label}曜日</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">時</label>
                            <select
                                value={formData.hour}
                                onChange={(e) => setFormData(prev => ({ ...prev, hour: parseInt(e.target.value) }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">分</label>
                            <select
                                value={formData.minute}
                                onChange={(e) => setFormData(prev => ({ ...prev, minute: parseInt(e.target.value) }))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                            >
                                {[0, 15, 30, 45].map(m => (
                                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={createTrigger}
                            disabled={saving}
                            className="btn-primary px-4 py-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : "作成"}
                        </button>
                    </div>
                </div>
            )}

            {/* トリガー一覧 */}
            <div className="space-y-3">
                {triggers.map((trigger) => (
                    <div
                        key={trigger.id}
                        className={clsx(
                            "flex items-center justify-between p-4 rounded-xl border transition-all",
                            trigger.enabled
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-slate-700/50 border-slate-600"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={clsx(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                trigger.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600 text-slate-400"
                            )}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{trigger.name || formatSchedule(trigger)}</h4>
                                <p className="text-sm text-slate-400">{formatSchedule(trigger)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleEnabled(trigger.id, trigger.enabled)}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    trigger.enabled
                                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                        : "bg-slate-600 text-slate-400 hover:bg-slate-500"
                                )}
                            >
                                <Power size={18} />
                            </button>
                            <button
                                onClick={() => deleteTrigger(trigger.id)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {triggers.length === 0 && !showForm && (
                <div className="text-center py-8 text-slate-400">
                    スケジュールされたトリガーはありません
                </div>
            )}
        </div>
    );
}
