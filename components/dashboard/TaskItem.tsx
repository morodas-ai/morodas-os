import { CheckCircle2 } from "lucide-react";

export default function TaskItem({ priority, title, time, agent, status, onStart, onComplete }: {
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
        <div className={`flex items-center gap-4 p-3 rounded-lg ${status === "done" ? "bg-surface-50" : "bg-white border border-surface-200 hover:border-primary-300"} transition-colors`}>
            <div className={`w-2 h-2 rounded-full ${status === "done" ? "bg-surface-300" : priorityColor}`} />
            <div className="flex-1">
                <p className={`font-medium ${status === "done" ? "text-muted line-through" : "text-sidebar"}`}>
                    {title}
                </p>
                <p className="text-xs text-muted flex items-center gap-2">
                    <span>{time}</span>
                    <span>•</span>
                    <span>{agent}</span>
                </p>
            </div>
            {status === "done" ? (
                <CheckCircle2 size={20} className="text-primary-500" />
            ) : status === "in_progress" ? (
                <button onClick={onComplete} className="btn-primary text-sm py-1.5 px-3 bg-primary-600">完了</button>
            ) : (
                <button onClick={onStart} className="btn-primary text-sm py-1.5 px-3">開始</button>
            )}
        </div>
    );
}
