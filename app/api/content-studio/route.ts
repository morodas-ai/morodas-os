import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: コンテンツ一覧（ContentIdea）
export async function GET() {
    try {
        const items = await prisma.contentIdea.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return NextResponse.json({ data: items });
    } catch (error) {
        console.error("Failed to fetch content:", error);
        return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
    }
}

// POST: 新規記事テーマ作成
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, angle, keywords } = body;

        if (!title) {
            return NextResponse.json(
                { error: "title is required" },
                { status: 400 }
            );
        }

        const item = await prisma.contentIdea.create({
            data: {
                title,
                angle: angle || null,
                keywords: keywords ? JSON.stringify(keywords.split(",").map((k: string) => k.trim())) : null,
                status: "candidate",
                source: "manual",
            },
        });

        return NextResponse.json({ data: item }, { status: 201 });
    } catch (error) {
        console.error("Failed to create content:", error);
        return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
    }
}
