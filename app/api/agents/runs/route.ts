import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: エージェント実行記録を作成（n8nから呼び出し）
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agentType, status, duration, output, error } = body;

        if (!agentType || !status) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "agentType and status are required" } },
                { status: 400 }
            );
        }

        // エージェントを検索
        const agent = await prisma.agent.findFirst({
            where: { type: agentType },
        });

        if (!agent) {
            return NextResponse.json(
                { success: false, error: { code: "AGENT_NOT_FOUND", message: `Agent with type ${agentType} not found` } },
                { status: 404 }
            );
        }

        // 実行記録を作成
        const run = await prisma.agentRun.create({
            data: {
                agentId: agent.id,
                status,
                duration,
                output: typeof output === "string" ? output : JSON.stringify(output || {}),
                error,
            },
        });

        // エージェントの最終実行時刻を更新
        await prisma.agent.update({
            where: { id: agent.id },
            data: { lastRunAt: new Date() },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: run.id,
                    agentId: run.agentId,
                    status: run.status,
                    duration: run.duration,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating agent run:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create agent run" } },
            { status: 500 }
        );
    }
}

// GET: エージェント実行履歴を取得
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const agentType = searchParams.get("agentType");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where: Record<string, unknown> = {};

        if (agentType) {
            const agent = await prisma.agent.findFirst({
                where: { type: agentType },
            });
            if (agent) {
                where.agentId = agent.id;
            }
        }

        const runs = await prisma.agentRun.findMany({
            where,
            include: {
                agent: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json({ success: true, data: runs });
    } catch (error) {
        console.error("Error fetching agent runs:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch agent runs" } },
            { status: 500 }
        );
    }
}
