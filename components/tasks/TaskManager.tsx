"use client";

import { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import TaskForm from "@/components/tasks/TaskForm";
import TaskItem from "@/components/tasks/TaskItem";

interface Agent {
    id: string;
    name: string;
    type: string;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    estimatedMinutes: number | null;
    agentId: string | null;
    agent?: Agent | null;
    githubIssueNumber?: number | null;
    githubIssueUrl?: string | null;
    createdAt: string;
}

export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // データ取得
    const fetchData = async () => {
        try {
            const [tasksRes, agentsRes] = await Promise.all([
                fetch("/api/tasks"),
                fetch("/api/agents"),
            ]);
            const tasksData = await tasksRes.json();
            const agentsData = await agentsRes.json();

            setTasks(tasksData.data || []);
            setAgents(agentsData.data || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // タスク保存後のリロード
    const handleSave = async () => {
        await fetchData();
        setIsFormOpen(false);
        setEditingTask(null);
    };

    // 編集開始
    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };

    // ステータス更新
    const handleStatusChange = async (id: string, status: string) => {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    // 削除リクエスト（モーダルを表示）
    const handleDeleteRequest = (id: string) => {
        setDeleteConfirmId(id);
    };

    // 削除実行
    const handleDeleteConfirm = async () => {
        if (!deleteConfirmId) return;
        try {
            await fetch(`/api/tasks/${deleteConfirmId}`, { method: "DELETE" });
            setTasks(tasks.filter(t => t.id !== deleteConfirmId));
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
        setDeleteConfirmId(null);
    };

    const taskToDelete = tasks.find(t => t.id === deleteConfirmId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">タスク管理</h1>
                    <p className="text-muted">タスクを管理し、エージェントにミッションを割り当てる</p>
                </div>
                <button
                    onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-lg transition-colors"
                >
                    <Plus size={18} />
                    新規タスク
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-muted">タスクを読み込み中...</div>
            ) : (
                <div className="grid gap-4">
                    {tasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onEdit={handleEdit}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteRequest}
                        />
                    ))}
                </div>
            )}

            {isFormOpen && (
                <TaskForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSave}
                    initialData={editingTask}
                    agents={agents}
                />
            )}

            {/* 削除確認モーダル */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl border border-primary-200 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="text-red-400" size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">タスクを削除</h3>
                                <p className="text-sm text-muted">この操作は取り消せません。</p>
                            </div>
                        </div>
                        {taskToDelete && (
                            <p className="text-foreground bg-primary-50 rounded-lg p-3 text-sm">
                                「{taskToDelete.title}」を削除しますか？
                            </p>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2 text-sm text-muted hover:bg-primary-50 rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors"
                            >
                                削除する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

