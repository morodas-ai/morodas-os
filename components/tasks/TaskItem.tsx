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
            isDone ? "bg-foreground/50 border-sidebar opacity-60" : "bg-sidebar border-sidebar-hover",
            isJules && !isDone && "border-l-4 border-l-purple-500 bg-purple-900/10"
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
                        <h3 className={clsx("font-medium text-lg leading-tight", isDone ? "text-surface-500 line-through" : "text-surface-100")}>
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-muted text-sm mt-1 line-clamp-2">{task.description}</p>
                        )}
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(task)} className="p-1 hover:bg-sidebar-hover rounded text-muted">Edit</button>
                        <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-red-900/30 rounded text-red-400">Delete</button>
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
                            isJules ? "bg-purple-500/20 text-purple-300" : "bg-sidebar-hover text-surface-300"
                        )}>
                            {isJules ? <Bot size={12} /> : <User size={12} />}
                            <span>{task.agent.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-surface-500">
                            <User size={12} />
                            <span>Unassigned</span>
                        </div>
                    )}

                    {/* GitHub Issue リンク */}
                    {task.githubIssueUrl && (
                        <a
                            href={task.githubIssueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
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

