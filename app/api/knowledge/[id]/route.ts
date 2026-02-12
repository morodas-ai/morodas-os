import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: 単一ページ取得
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const page = await prisma.knowledgePage.findUnique({ where: { id } });

        if (!page) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Page not found" } },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: page });
    } catch (error) {
        console.error("Error fetching page:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch page" } },
            { status: 500 }
        );
    }
}

// PATCH: ページ更新
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, content, category, tags, emoji } = body;

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (category !== undefined) updateData.category = category;
        if (tags !== undefined) updateData.tags = JSON.stringify(tags);
        if (emoji !== undefined) updateData.emoji = emoji;

        const page = await prisma.knowledgePage.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, data: page });
    } catch (error) {
        console.error("Error updating page:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update page" } },
            { status: 500 }
        );
    }
}

// DELETE: ページ削除
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.knowledgePage.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting page:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete page" } },
            { status: 500 }
        );
    }
}
