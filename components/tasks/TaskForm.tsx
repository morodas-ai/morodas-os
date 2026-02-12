"use client";

import { useState, useEffect } from "react";
import { X, Bot } from "lucide-react";

interface Agent {
    id: string;
    name: string;
    type: string;
}

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
    agents: Agent[];
}

export default function TaskForm({ isOpen, onClose, onSave, initialData, agents }: TaskFormProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        estimatedMinutes: "",
        agentId: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || "",
                priority: initialData.priority,
                estimatedMinutes: initialData.estimatedMinutes?.toString() || "",
                agentId: initialData.agentId || "",
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = initialData ? `/api/tasks/${initialData.id}` : "/api/tasks";
            const method = initialData ? "PATCH" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            onSave();
        } catch (error) {
            console.error("Failed to save task:", error);
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-primary-200">
                <div className="flex items-center justify-between p-4 border-b border-primary-200">
                    <h2 className="font-bold text-lg text-foreground">
                        {initialData ? "タスク編集" : "新規タスク"}
                    </h2>
                    <button onClick={onClose} className="text-muted hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">タイトル</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary-500"
                            placeholder="何をする必要がありますか？"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">説明</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 text-foreground h-24 focus:outline-none focus:border-primary-500"
                            placeholder="詳細..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">優先度</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary-500"
                            >
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">見積（分）</label>
                            <input
                                type="number"
                                value={formData.estimatedMinutes}
                                onChange={e => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                                className="w-full bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">エージェント割当</label>
                        <div className="relative">
                            <select
                                value={formData.agentId}
                                onChange={e => setFormData({ ...formData, agentId: e.target.value })}
                                className="w-full bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary-500 appearance-none"
                            >
                                <option value="">-- なし --</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.name} ({agent.type})
                                    </option>
                                ))}
                            </select>
                            <Bot className="absolute right-3 top-2.5 text-muted pointer-events-none" size={16} />
                        </div>
                        {formData.agentId === "jules-gh-executor" && (
                            <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                                <Bot size={12} />
                                Julesに割り当てるとGitHubワークフローがトリガーされます。
                            </p>
                        )}
                    </div>

                    <div className="pt-2 flex justify-end gap-2 text-sm font-medium">
                        <button type="button" onClick={onClose} className="px-4 py-2 hover:bg-primary-50 rounded-lg text-muted">
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-lg"
                        >
                            {isSubmitting ? "保存中..." : "保存"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
