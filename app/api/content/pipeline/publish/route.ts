import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: WordPress公開トリガー
export async function POST(request: Request) {
    try {
        const { ideaId } = await request.json();

        if (!ideaId) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "ideaId required" } },
                { status: 400 }
            );
        }

        const idea = await prisma.contentIdea.findUnique({ where: { id: ideaId } });
        if (!idea || !idea.articleBody) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Draft not found" } },
                { status: 404 }
            );
        }

        // ステータスを publishing に更新
        await prisma.contentIdea.update({
            where: { id: ideaId },
            data: { status: "publishing" },
        });

        // n8n の publisher webhook を呼び出し
        const n8nPublisherUrl = process.env.N8N_PUBLISHER_WEBHOOK;

        if (n8nPublisherUrl) {
            try {
                const meta = idea.articleMeta ? JSON.parse(idea.articleMeta) : {};

                const response = await fetch(n8nPublisherUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ideaId: idea.id,
                        seo_title: meta?.seo?.final_title || idea.title,
                        article_body: idea.articleBody,
                        metadata: meta,
                    }),
                });

                const result = await response.json();

                // WP投稿結果を保存
                await prisma.contentIdea.update({
                    where: { id: ideaId },
                    data: {
                        status: "published",
                        wpPostId: result.post_id || null,
                        wpPostUrl: result.post_url || null,
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: "Published to WordPress",
                    wpPostUrl: result.post_url,
                });
            } catch (err) {
                // n8n呼び出し失敗時はステータスをdraftに戻す
                await prisma.contentIdea.update({
                    where: { id: ideaId },
                    data: { status: "draft" },
                });
                console.error("n8n publisher call failed:", err);
                return NextResponse.json(
                    { success: false, error: { code: "N8N_ERROR", message: "WordPress publishing failed" } },
                    { status: 502 }
                );
            }
        } else {
            // n8n URLが未設定の場合はステータスだけ更新
            await prisma.contentIdea.update({
                where: { id: ideaId },
                data: { status: "published" },
            });

            return NextResponse.json({
                success: true,
                message: "Marked as published (N8N_PUBLISHER_WEBHOOK not set)",
            });
        }
    } catch (error) {
        console.error("Error publishing:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to publish" } },
            { status: 500 }
        );
    }
}
