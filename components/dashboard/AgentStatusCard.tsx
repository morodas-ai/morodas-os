export default function AgentStatusCard({ name, lastRun, status, outputs }: {
    name: string;
    lastRun: string;
    status: "active" | "stopped";
    outputs: number;
}) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-primary-500" : "bg-surface-300"}`} />
                <span className="font-medium text-sidebar-hover">{name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
                <span>最終実行: {lastRun}</span>
                <span className="bg-surface-200 px-2 py-0.5 rounded text-xs">{outputs}件</span>
            </div>
        </div>
    );
}
