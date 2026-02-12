import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: 記事生成トリガー
// MORODAS OS → n8n article-generator webhook
export async function POST(request: Request) {
    try {
        const { ideaId } = await request.json();

        if (!ideaId) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "ideaId required" } },
                { status: 400 }
            );
        }

        // ネタを取得
        const idea = await prisma.contentIdea.findUnique({ where: { id: ideaId } });
        if (!idea) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Idea not found" } },
                { status: 404 }
            );
        }

        // ステータスを generating に更新
        await prisma.contentIdea.update({
            where: { id: ideaId },
            data: { status: "generating" },
        });

        // n8n の article-generator webhook を呼び出し（非同期）
        // n8n webhook URLは環境変数から取得
        const n8nWebhookUrl = process.env.N8N_ARTICLE_GENERATOR_WEBHOOK;

        if (n8nWebhookUrl) {
            // Fireして忘れる（非同期バックグラウンド）
            const keywords = idea.keywords ? JSON.parse(idea.keywords) : [];
            fetch(n8nWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ideaId: idea.id,
                    theme: idea.title,
                    angle: idea.angle || "",
                    target_keywords: keywords.join(", "),
                    source_summary: idea.summary || "",
                    callbackUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/content/pipeline/draft`,
                }),
            }).catch((err) => console.error("n8n webhook call failed:", err));
        } else {
            console.warn("N8N_ARTICLE_GENERATOR_WEBHOOK not set. Skipping n8n trigger.");
        }

        return NextResponse.json({
            success: true,
            message: "Article generation started",
            ideaId,
            status: "generating",
        });
    } catch (error) {
        console.error("Error triggering generation:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to trigger generation" } },
            { status: 500 }
        );
    }
}
