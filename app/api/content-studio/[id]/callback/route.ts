import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: n8n から記事生成完了時のコールバック
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { articleBody, articleMeta, wpPostId, wpPostUrl, n8nExecutionId } = body;

        const updated = await prisma.contentIdea.update({
            where: { id },
            data: {
                status: wpPostUrl ? "published" : "draft",
                articleBody: articleBody || null,
                articleMeta: articleMeta ? JSON.stringify(articleMeta) : null,
                wpPostId: wpPostId || null,
                wpPostUrl: wpPostUrl || null,
                n8nExecutionId: n8nExecutionId || null,
            },
        });

        return NextResponse.json({
            data: updated,
            message: "Article updated successfully",
        });
    } catch (error) {
        console.error("Failed to process callback:", error);
        return NextResponse.json({ error: "Failed to process callback" }, { status: 500 });
    }
}
