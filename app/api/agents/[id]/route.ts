import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: エージェント詳細
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const agent = await prisma.agent.findUnique({ where: { id } });
        if (!agent) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Agent not found" } },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: agent });
    } catch (error) {
        console.error("Error fetching agent:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch agent" } },
            { status: 500 }
        );
    }
}

// PATCH: エージェント更新
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, type, description, enabled, config } = body;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;
        if (description !== undefined) updateData.description = description;
        if (enabled !== undefined) updateData.enabled = enabled;
        if (config !== undefined) updateData.config = typeof config === "string" ? config : JSON.stringify(config);

        const agent = await prisma.agent.update({ where: { id }, data: updateData });
        return NextResponse.json({ success: true, data: agent });
    } catch (error) {
        console.error("Error updating agent:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update agent" } },
            { status: 500 }
        );
    }
}

// DELETE: エージェント削除
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.agent.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting agent:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete agent" } },
            { status: 500 }
        );
    }
}
