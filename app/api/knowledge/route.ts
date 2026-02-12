import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: ナレッジページ一覧（検索・カテゴリフィルタ対応）
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q") || "";
        const category = searchParams.get("category") || "";

        const pages = await prisma.knowledgePage.findMany({
            where: {
                AND: [
                    q ? {
                        OR: [
                            { title: { contains: q } },
                            { content: { contains: q } },
                        ],
                    } : {},
                    category ? { category } : {},
                ],
            },
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json({ success: true, data: pages });
    } catch (error) {
        console.error("Error fetching knowledge pages:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch pages" } },
            { status: 500 }
        );
    }
}

// POST: 新規ページ作成
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, category, tags, emoji } = body;

        if (!title) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "title is required" } },
                { status: 400 }
            );
        }

        const page = await prisma.knowledgePage.create({
            data: {
                title,
                content: content || "",
                category: category || "general",
                tags: tags ? JSON.stringify(tags) : "[]",
                emoji: emoji || "📄",
            },
        });

        return NextResponse.json({ success: true, data: page }, { status: 201 });
    } catch (error) {
        console.error("Error creating knowledge page:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create page" } },
            { status: 500 }
        );
    }
}
