import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: n8n から記事生成/公開完了時のコールバック
// 成功時: { articleBody, articleMeta, wpPostId, wpPostUrl, n8nExecutionId }
// エラー時: { error: "...", n8nExecutionId }
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { articleBody, articleMeta, wpPostId, wpPostUrl, n8nExecutionId, error } = body;

        // n8nからエラーが返ってきた場合
        if (error) {
            const updated = await prisma.contentIdea.update({
                where: { id },
                data: {
                    status: "error",
                    articleMeta: JSON.stringify({ error: String(error) }),
                    n8nExecutionId: n8nExecutionId || null,
                },
            });
            return NextResponse.json({
                data: updated,
                message: "Error reported from n8n",
            });
        }

        // 正常時: 記事データを保存
        // ステータス: wpPostUrlがあれば公開済み、articleBodyだけなら下書き
        const newStatus = wpPostUrl ? "published" : "draft";

        const updated = await prisma.contentIdea.update({
            where: { id },
            data: {
                status: newStatus,
                articleBody: articleBody || null,
                articleMeta: articleMeta ? JSON.stringify(articleMeta) : null,
                wpPostId: wpPostId ? Number(wpPostId) : null,
                wpPostUrl: wpPostUrl || null,
                n8nExecutionId: n8nExecutionId || null,
            },
        });

        return NextResponse.json({
            data: updated,
            message: `Article ${newStatus === "published" ? "published" : "saved as draft"} successfully`,
        });
    } catch (error) {
        console.error("Failed to process callback:", error);
        return NextResponse.json({ error: "Failed to process callback" }, { status: 500 });
    }
}
