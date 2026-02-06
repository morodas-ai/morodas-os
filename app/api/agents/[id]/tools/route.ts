import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: エージェントのツール連携一覧
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const agentTools = await prisma.agentTool.findMany({
            where: { agentId: id },
            include: { tool: true },
        });
        return NextResponse.json({ data: agentTools });
    } catch (error) {
        console.error("Failed to fetch agent tools:", error);
        return NextResponse.json({ error: "Failed to fetch agent tools" }, { status: 500 });
    }
}

// POST: ツール連携を追加
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { toolId } = body;

        // 既存チェック
        const existing = await prisma.agentTool.findUnique({
            where: { agentId_toolId: { agentId: id, toolId } },
        });

        if (existing) {
            return NextResponse.json({ data: existing }, { status: 200 });
        }

        const agentTool = await prisma.agentTool.create({
            data: {
                agentId: id,
                toolId,
                isConnected: true,
            },
            include: { tool: true },
        });

        return NextResponse.json({ data: agentTool }, { status: 201 });
    } catch (error) {
        console.error("Failed to create agent tool:", error);
        return NextResponse.json({ error: "Failed to create agent tool" }, { status: 500 });
    }
}

// PATCH: ツール連携状態を更新
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { toolId, isConnected } = body;

        const agentTool = await prisma.agentTool.update({
            where: { agentId_toolId: { agentId: id, toolId } },
            data: { isConnected },
            include: { tool: true },
        });

        return NextResponse.json({ data: agentTool });
    } catch (error) {
        console.error("Failed to update agent tool:", error);
        return NextResponse.json({ error: "Failed to update agent tool" }, { status: 500 });
    }
}

// DELETE: ツール連携を削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(request.url);
        const toolId = searchParams.get("toolId");

        if (!toolId) {
            return NextResponse.json({ error: "toolId is required" }, { status: 400 });
        }

        await prisma.agentTool.delete({
            where: { agentId_toolId: { agentId: id, toolId } },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete agent tool:", error);
        return NextResponse.json({ error: "Failed to delete agent tool" }, { status: 500 });
    }
}
