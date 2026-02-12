import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: ネタ候補一覧（ステータスフィルター対応）
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where = status ? { status } : {};

        const ideas = await prisma.contentIdea.findMany({
            where,
            orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        });

        return NextResponse.json({ success: true, data: ideas });
    } catch (error) {
        console.error("Error fetching content ideas:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch ideas" } },
            { status: 500 }
        );
    }
}

// POST: n8nからネタ候補バッチ受信
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 配列 or 単体の両方に対応
        const candidates = Array.isArray(body) ? body : [body];

        const created = await Promise.all(
            candidates.map((c: {
                title: string;
                source?: string;
                sourceUrl?: string;
                angle?: string;
                score?: number;
                keywords?: string | string[];
                summary?: string;
            }) =>
                prisma.contentIdea.create({
                    data: {
                        title: c.title,
                        source: c.source || null,
                        sourceUrl: c.sourceUrl || null,
                        angle: c.angle || null,
                        score: c.score || 0,
                        keywords: typeof c.keywords === "string" ? c.keywords : JSON.stringify(c.keywords || []),
                        summary: c.summary || null,
                        status: "candidate",
                    },
                })
            )
        );

        return NextResponse.json(
            { success: true, data: created, count: created.length },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating content ideas:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create ideas" } },
            { status: 500 }
        );
    }
}

// PATCH: ステータス更新（reject等）
export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "id and status required" } },
                { status: 400 }
            );
        }

        const updated = await prisma.contentIdea.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Error updating content idea:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update idea" } },
            { status: 500 }
        );
    }
}
