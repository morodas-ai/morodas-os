import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: コンテンツ一覧
export async function GET() {
    try {
        const content = await prisma.content.findMany({ orderBy: { updatedAt: "desc" } });
        return NextResponse.json({ success: true, data: content });
    } catch (error) {
        console.error("Error fetching content:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch content" } },
            { status: 500 }
        );
    }
}

// POST: コンテンツ作成
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, platform, type, status, body: contentBody, scheduledAt, notes } = body;

        if (!title || !platform) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "title and platform are required" } },
                { status: 400 }
            );
        }

        const content = await prisma.content.create({
            data: {
                title,
                platform,
                type: type || "post",
                status: status || "idea",
                body: contentBody,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
                notes,
            },
        });

        return NextResponse.json({ success: true, data: content }, { status: 201 });
    } catch (error) {
        console.error("Error creating content:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create content" } },
            { status: 500 }
        );
    }
}

// PATCH: コンテンツ更新
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "id is required" } },
                { status: 400 }
            );
        }

        if (updateData.scheduledAt) updateData.scheduledAt = new Date(updateData.scheduledAt);
        if (updateData.publishedAt) updateData.publishedAt = new Date(updateData.publishedAt);

        const content = await prisma.content.update({ where: { id }, data: updateData });
        return NextResponse.json({ success: true, data: content });
    } catch (error) {
        console.error("Error updating content:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update content" } },
            { status: 500 }
        );
    }
}

// DELETE: コンテンツ削除
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "id is required" } },
                { status: 400 }
            );
        }

        await prisma.content.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting content:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete content" } },
            { status: 500 }
        );
    }
}
