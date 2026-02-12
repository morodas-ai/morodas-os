import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateNextFireAt } from "@/lib/triggerSchedule";

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

        const resolvedHour = hour ?? 9;
        const resolvedMinute = minute ?? 0;

        // 次回実行日時を計算
        const nextFireAt = calculateNextFireAt({
            frequency,
            dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
            dayOfMonth: frequency === "monthly" ? dayOfMonth : null,
            hour: resolvedHour,
            minute: resolvedMinute,
        });

        const trigger = await prisma.trigger.create({
            data: {
                agentId: id,
                name: name || `${frequency} trigger`,
                frequency,
                dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
                dayOfMonth: frequency === "monthly" ? dayOfMonth : null,
                hour: resolvedHour,
                minute: resolvedMinute,
                enabled: true,
                nextFireAt,
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

        // enabledがtrueに変わった場合、またはスケジュール変更がある場合はnextFireAtを再計算
        let nextFireAt: Date | undefined;
        if (enabled === true || updates.frequency || updates.hour !== undefined || updates.minute !== undefined) {
            // 現在のトリガー情報を取得
            const current = await prisma.trigger.findUnique({ where: { id: triggerId } });
            if (current) {
                nextFireAt = calculateNextFireAt({
                    frequency: updates.frequency || current.frequency,
                    dayOfWeek: updates.dayOfWeek !== undefined ? updates.dayOfWeek : current.dayOfWeek,
                    dayOfMonth: updates.dayOfMonth !== undefined ? updates.dayOfMonth : current.dayOfMonth,
                    hour: updates.hour !== undefined ? updates.hour : current.hour,
                    minute: updates.minute !== undefined ? updates.minute : current.minute,
                });
            }
        }

        const trigger = await prisma.trigger.update({
            where: { id: triggerId },
            data: {
                enabled: enabled !== undefined ? enabled : undefined,
                ...updates,
                ...(nextFireAt ? { nextFireAt } : {}),
                // 無効化時はnextFireAtをクリア
                ...(enabled === false ? { nextFireAt: null } : {}),
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
