import { NextResponse } from "next/server";

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || "http://133.18.124.53:5678";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

interface N8nExecution {
    id: number;
    finished: boolean;
    mode: string;
    startedAt: string;
    stoppedAt: string | null;
    workflowId: string;
    workflowData?: {
        name: string;
    };
    status: "success" | "error" | "running" | "waiting" | "canceled";
}

interface WorkflowStatus {
    id: string;
    name: string;
    category: string;
    active: boolean;
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

function categorizeWorkflow(name: string): string {
    if (name.startsWith("MORODAS-")) return "MORODAS";
    if (name.includes("ニュース") || name.includes("学徒式") || name.includes("A2A2A")) return "ニュース/AI";
    if (name.includes("予約")) return "予約";
    if (name.includes("GitHub") || name.includes("Factory")) return "CI/CD";
    return "その他";
}

// GET: n8n ワークフロー実行状況を取得
export async function GET() {
    if (!N8N_API_KEY) {
        return NextResponse.json(
            { error: "N8N_API_KEY not configured" },
            { status: 500 }
        );
    }

    try {
        // 1. 全ワークフロー取得
        const wfRes = await fetch(`${N8N_BASE_URL}/api/v1/workflows?limit=50`, {
            headers: { "X-N8N-API-KEY": N8N_API_KEY },
            next: { revalidate: 30 }, // 30秒キャッシュ
        });

        if (!wfRes.ok) {
            throw new Error(`Workflows API error: ${wfRes.status}`);
        }

        const wfData = await wfRes.json();
        const workflows = wfData.data || [];

        // 2. 直近の実行履歴を取得
        const execRes = await fetch(
            `${N8N_BASE_URL}/api/v1/executions?limit=100`,
            {
                headers: { "X-N8N-API-KEY": N8N_API_KEY },
                next: { revalidate: 30 },
            }
        );

        if (!execRes.ok) {
            throw new Error(`Executions API error: ${execRes.status}`);
        }

        const execData = await execRes.json();
        const executions: N8nExecution[] = execData.data || [];

        // 3. ワークフローごとに集計
        const now = new Date();
        const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const statusMap: Record<string, WorkflowStatus> = {};

        for (const wf of workflows) {
            const wfExecs = executions.filter(
                (e: N8nExecution) => e.workflowId === wf.id
            );
            const recent24h = wfExecs.filter(
                (e: N8nExecution) => new Date(e.startedAt) >= h24Ago
            );

            const lastExec = wfExecs[0]; // API returns newest first

            statusMap[wf.id] = {
                id: wf.id,
                name: wf.name,
                category: categorizeWorkflow(wf.name),
                active: wf.active ?? false,
                lastExecution: lastExec
                    ? {
                        status: lastExec.status,
                        startedAt: lastExec.startedAt,
                        stoppedAt: lastExec.stoppedAt,
                        durationMs:
                            lastExec.stoppedAt
                                ? new Date(lastExec.stoppedAt).getTime() -
                                new Date(lastExec.startedAt).getTime()
                                : null,
                    }
                    : null,
                stats24h: {
                    total: recent24h.length,
                    success: recent24h.filter((e: N8nExecution) => e.status === "success").length,
                    error: recent24h.filter((e: N8nExecution) => e.status === "error").length,
                    successRate:
                        recent24h.length > 0
                            ? Math.round(
                                (recent24h.filter((e: N8nExecution) => e.status === "success").length /
                                    recent24h.length) *
                                100
                            )
                            : 100,
                },
            };
        }

        // カテゴリ別にグループ化
        const categories: Record<string, WorkflowStatus[]> = {};
        for (const ws of Object.values(statusMap)) {
            if (!categories[ws.category]) categories[ws.category] = [];
            categories[ws.category].push(ws);
        }

        // 各カテゴリ内を名前順にソート
        for (const cat of Object.keys(categories)) {
            categories[cat].sort((a, b) => a.name.localeCompare(b.name));
        }

        // 全体サマリー
        const allStatuses = Object.values(statusMap);
        const summary = {
            totalWorkflows: allStatuses.length,
            activeWorkflows: workflows.filter((w: { active: boolean }) => w.active).length,
            totalExecutions24h: allStatuses.reduce((sum, ws) => sum + ws.stats24h.total, 0),
            errorCount24h: allStatuses.reduce((sum, ws) => sum + ws.stats24h.error, 0),
            overallSuccessRate:
                allStatuses.reduce((sum, ws) => sum + ws.stats24h.total, 0) > 0
                    ? Math.round(
                        (allStatuses.reduce((sum, ws) => sum + ws.stats24h.success, 0) /
                            allStatuses.reduce((sum, ws) => sum + ws.stats24h.total, 0)) *
                        100
                    )
                    : 100,
        };

        return NextResponse.json({ summary, categories });
    } catch (error) {
        console.error("n8n API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch n8n data", detail: String(error) },
            { status: 502 }
        );
    }
}
