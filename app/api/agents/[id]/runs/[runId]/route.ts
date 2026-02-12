import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: 個別Run詳細を取得
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; runId: string }> }
) {
    const { id: agentId, runId } = await params;
    try {
        const run = await prisma.agentRun.findFirst({
            where: { id: runId, agentId },
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        if (!run) {
            return NextResponse.json(
                { success: false, error: "Run not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: run });
    } catch (error) {
        console.error("Failed to fetch run detail:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch run detail" },
            { status: 500 }
        );
    }
}
