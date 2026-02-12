import { NextResponse } from "next/server";

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || "http://133.18.124.53:5678";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

// POST: Activate/Deactivate/Execute a workflow
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!N8N_API_KEY) {
        return NextResponse.json({ error: "N8N_API_KEY not configured" }, { status: 500 });
    }

    try {
        const { action } = await request.json();

        if (action === "activate") {
            const res = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${id}/activate`, {
                method: "POST",
                headers: { "X-N8N-API-KEY": N8N_API_KEY },
            });
            if (!res.ok) throw new Error(`Activate failed: ${res.status}`);
            const data = await res.json();
            return NextResponse.json({ success: true, active: data.active, name: data.name });
        }

        if (action === "deactivate") {
            const res = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${id}/deactivate`, {
                method: "POST",
                headers: { "X-N8N-API-KEY": N8N_API_KEY },
            });
            if (!res.ok) throw new Error(`Deactivate failed: ${res.status}`);
            const data = await res.json();
            return NextResponse.json({ success: true, active: data.active, name: data.name });
        }

        if (action === "execute") {
            // Trigger a manual execution via the executions API
            const res = await fetch(`${N8N_BASE_URL}/api/v1/executions`, {
                method: "POST",
                headers: {
                    "X-N8N-API-KEY": N8N_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ workflowId: id }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Execute failed: ${res.status} - ${errText}`);
            }
            const data = await res.json();
            return NextResponse.json({ success: true, executionId: data.id });
        }

        return NextResponse.json({ error: "Invalid action. Use: activate, deactivate, execute" }, { status: 400 });
    } catch (error) {
        console.error("n8n workflow action failed:", error);
        return NextResponse.json(
            { error: "Failed to perform action", detail: String(error) },
            { status: 502 }
        );
    }
}
