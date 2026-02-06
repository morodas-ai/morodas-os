import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: エージェントの実行履歴一覧
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const runs = await prisma.agentRun.findMany({
            where: { agentId: id },
            orderBy: { createdAt: "desc" },
            take: 20, // 最新20件
        });
        return NextResponse.json({ data: runs });
    } catch (error) {
        console.error("Failed to fetch agent runs:", error);
        return NextResponse.json({ error: "Failed to fetch agent runs" }, { status: 500 });
    }
}
