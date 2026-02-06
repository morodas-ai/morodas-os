import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: セッション詳細＋メッセージ
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await prisma.chatSession.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Session not found" } },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: session });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch session" } },
            { status: 500 }
        );
    }
}

// PATCH: セッション更新（タイトル等）
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, isActive } = body;

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (isActive !== undefined) updateData.isActive = isActive;

        const session = await prisma.chatSession.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, data: session });
    } catch (error) {
        console.error("Error updating session:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update session" } },
            { status: 500 }
        );
    }
}

// DELETE: セッション削除
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.chatSession.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete session" } },
            { status: 500 }
        );
    }
}
