import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: n8nから生成完了した記事を受信
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ideaId, articleBody, articleMeta, n8nExecutionId } = body;

        if (!ideaId) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "ideaId required" } },
                { status: 400 }
            );
        }

        const idea = await prisma.contentIdea.findUnique({ where: { id: ideaId } });
        if (!idea) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Idea not found" } },
                { status: 404 }
            );
        }

        // ドラフト保存
        const updated = await prisma.contentIdea.update({
            where: { id: ideaId },
            data: {
                status: "draft",
                articleBody: articleBody || null,
                articleMeta: typeof articleMeta === "string" ? articleMeta : JSON.stringify(articleMeta || {}),
                n8nExecutionId: n8nExecutionId || null,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Error saving draft:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to save draft" } },
            { status: 500 }
        );
    }
}
