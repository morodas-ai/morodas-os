import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: エージェントのトリガー一覧
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const triggers = await prisma.trigger.findMany({
            where: { agentId: id },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ data: triggers });
    } catch (error) {
        console.error("Failed to fetch triggers:", error);
        return NextResponse.json({ error: "Failed to fetch triggers" }, { status: 500 });
    }
}

// POST: トリガーを作成
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, frequency, dayOfWeek, dayOfMonth, hour, minute } = body;

        const trigger = await prisma.trigger.create({
            data: {
                agentId: id,
                name: name || `${frequency} trigger`,
                frequency,
                dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
                dayOfMonth: frequency === "monthly" ? dayOfMonth : null,
                hour: hour ?? 9,
                minute: minute ?? 0,
                enabled: true,
            },
        });

        return NextResponse.json({ data: trigger }, { status: 201 });
    } catch (error) {
        console.error("Failed to create trigger:", error);
        return NextResponse.json({ error: "Failed to create trigger" }, { status: 500 });
    }
}

// PATCH: トリガーを更新
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { triggerId, enabled, ...updates } = body;

        const trigger = await prisma.trigger.update({
            where: { id: triggerId },
            data: {
                enabled: enabled !== undefined ? enabled : undefined,
                ...updates,
            },
        });

        return NextResponse.json({ data: trigger });
    } catch (error) {
        console.error("Failed to update trigger:", error);
        return NextResponse.json({ error: "Failed to update trigger" }, { status: 500 });
    }
}

// DELETE: トリガーを削除
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(request.url);
        const triggerId = searchParams.get("triggerId");

        if (!triggerId) {
            return NextResponse.json({ error: "triggerId is required" }, { status: 400 });
        }

        await prisma.trigger.delete({
            where: { id: triggerId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete trigger:", error);
        return NextResponse.json({ error: "Failed to delete trigger" }, { status: 500 });
    }
}
