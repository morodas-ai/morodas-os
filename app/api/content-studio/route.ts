import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: コンテンツ一覧（ContentIdea）
// 副作用: 10分以上 generating/publishing のまま放置されたアイテムを自動で error に遷移
export async function GET() {
    try {
        // Stuck detection: 10分以上 generating/publishing のまま → error に自動遷移
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        await prisma.contentIdea.updateMany({
            where: {
                status: { in: ["generating", "publishing"] },
                updatedAt: { lt: tenMinutesAgo },
            },
            data: {
                status: "error",
            },
        });

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
