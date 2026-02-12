import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH: タスク更新
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status, agentId, priority, completedAt } = body;

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (agentId !== undefined) updateData.agentId = agentId;
        if (priority !== undefined) updateData.priority = priority;

        // 完了日時
        if (status === "done" && !completedAt) {
            updateData.completedAt = new Date();
        } else if (completedAt) {
            updateData.completedAt = completedAt;
        }

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ data: task });
    } catch (error) {
        console.error("Failed to update task:", error);
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

// DELETE: タスク削除
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.task.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete task:", error);
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
