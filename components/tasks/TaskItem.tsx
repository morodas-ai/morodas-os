"use client";

import { CheckCircle2, Circle, Clock, User, Bot, ExternalLink } from "lucide-react";
import clsx from "clsx";

interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    estimatedMinutes: number | null;
    agentId: string | null;
    agent?: { id: string; name: string; type: string } | null;
    githubIssueNumber?: number | null;
    githubIssueUrl?: string | null;
    createdAt: string;
}

interface TaskItemProps {
    task: Task;
    onEdit: (task: Task) => void;
    onStatusChange: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}

export default function TaskItem({ task, onEdit, onStatusChange, onDelete }: TaskItemProps) {
    const isDone = task.status === "done";
    const priorityColor =
        task.priority === "high" ? "bg-red-500" :
            task.priority === "medium" ? "bg-yellow-500" :
                "bg-primary-500";

    const isJules = task.agent?.name === "Jules" || task.agentId?.includes("jules");

    return (
        <div className={clsx(
            "p-4 rounded-xl border transition-all hover:shadow-md flex items-start gap-4 group",
            isDone ? "bg-primary-50/50 border-primary-100 opacity-60" : "bg-white border-primary-200",
            isJules && !isDone && "border-l-4 border-l-purple-500 bg-purple-50/30"
        )}>
            <button
                onClick={() => onStatusChange(task.id, isDone ? "pending" : "done")}
                className="mt-1 text-muted hover:text-primary-500 transition-colors"
            >
                {isDone ? <CheckCircle2 size={22} className="text-primary-500" /> : <Circle size={22} />}
            </button>

            <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className={clsx("font-medium text-lg leading-tight", isDone ? "text-muted line-through" : "text-foreground")}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-muted text-sm mt-1 line-clamp-2">{task.description}</p>
                        )}
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(task)} className="p-1 hover:bg-primary-50 rounded text-muted">編集</button>
                        <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-red-50 rounded text-red-400">削除</button>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted mt-2">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
                        <span className="capitalize">{task.priority}</span>
                    </div>

                    {task.estimatedMinutes && (
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{task.estimatedMinutes}m</span>
                        </div>
                    )}

                    {task.agent ? (
                        <div className={clsx(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium",
                            isJules ? "bg-purple-100 text-purple-600" : "bg-primary-100 text-primary-700"
                        )}>
                            {isJules ? <Bot size={12} /> : <User size={12} />}
                            <span>{task.agent.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-muted">
                            <User size={12} />
                            <span>未割当</span>
                        </div>
                    )}

                    {/* GitHub Issue リンク */}
                    {task.githubIssueUrl && (
                        <a
                            href={task.githubIssueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-500 hover:text-purple-400 transition-colors"
                        >
                            <ExternalLink size={12} />
                            <span>Issue #{task.githubIssueNumber}</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

