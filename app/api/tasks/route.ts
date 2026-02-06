import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: タスク一覧を取得
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where: Record<string, unknown> = {};
        if (status && status !== "all") {
            where.status = status;
        }

        const tasks = await prisma.task.findMany({
            where,
            include: {
                report: { select: { id: true, title: true } },
            },
            orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        });

        return NextResponse.json({ success: true, data: tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch tasks" } },
            { status: 500 }
        );
    }
}

// POST: 新しいタスクを作成
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const task = await prisma.task.create({
            data: {
                title: body.title,
                description: body.description,
                priority: body.priority || "medium",
                estimatedMinutes: body.estimatedMinutes,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
                agentType: body.agentType,
                reportId: body.reportId,
            },
        });
        return NextResponse.json({ success: true, data: task }, { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create task" } },
            { status: 500 }
        );
    }
}

// PATCH: タスクを更新
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, priority, title, description } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "id is required" } },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status) updateData.lastActivityAt = new Date();

        const task = await prisma.task.update({ where: { id }, data: updateData });
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update task" } },
            { status: 500 }
        );
    }
}
