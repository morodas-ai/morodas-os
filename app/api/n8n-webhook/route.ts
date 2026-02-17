import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/n8n-webhook
 *
 * n8n ワークフローからの統一受信エンドポイント。
 * Discord Webhook の代わりにこちらへ送信し、MORODAS OS 上で管理する。
 *
 * 認証: N8N_WEBHOOK_SECRET ヘッダーで検証
 */
export async function POST(request: Request) {
    try {
        // 認証チェック
        const secret = request.headers.get("x-n8n-webhook-secret");
        const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
        if (expectedSecret && secret !== expectedSecret) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Invalid webhook secret" } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            type,          // "news" | "article" | "alert"
            title,
            content,
            source,        // "TechCrunch" etc.
            sourceUrl,
            score,         // Gemini評価スコア (0-100)
            keywords,      // カンマ区切り or JSON配列
            workflowId,
            executionId,
        } = body;

        if (!type || !title) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "type and title are required" } },
                { status: 400 }
            );
        }

        switch (type) {
            case "news": {
                // ニュース → ContentIdea (candidate) として保存
                const idea = await prisma.contentIdea.create({
                    data: {
                        title,
                        source: source || "n8n",
                        sourceUrl: sourceUrl || null,
                        summary: typeof content === "string" ? content.slice(0, 2000) : null,
                        score: score || 50,
                        keywords: Array.isArray(keywords)
                            ? JSON.stringify(keywords)
                            : keywords
                                ? JSON.stringify(keywords.split(",").map((k: string) => k.trim()))
                                : null,
                        status: "candidate",
                        n8nExecutionId: executionId || null,
                    },
                });

                return NextResponse.json(
                    { success: true, type: "news", data: { id: idea.id, title: idea.title } },
                    { status: 201 }
                );
            }

            case "article": {
                // 記事ドラフト → ContentIdea (draft) として保存
                const article = await prisma.contentIdea.create({
                    data: {
                        title,
                        source: source || "n8n",
                        sourceUrl: sourceUrl || null,
                        summary: typeof content === "string" ? content.slice(0, 500) : null,
                        articleBody: typeof content === "string" ? content : JSON.stringify(content),
                        score: score || 70,
                        keywords: Array.isArray(keywords)
                            ? JSON.stringify(keywords)
                            : keywords
                                ? JSON.stringify(keywords.split(",").map((k: string) => k.trim()))
                                : null,
                        status: "draft",
                        n8nExecutionId: executionId || null,
                    },
                });

                return NextResponse.json(
                    { success: true, type: "article", data: { id: article.id, title: article.title } },
                    { status: 201 }
                );
            }

            case "alert": {
                // アラート → Alert として保存
                const alert = await prisma.alert.create({
                    data: {
                        type: "system",
                        severity: body.severity || "info",
                        title,
                        message: typeof content === "string" ? content : JSON.stringify(content),
                        relatedType: "workflow",
                        relatedId: workflowId || null,
                    },
                });

                return NextResponse.json(
                    { success: true, type: "alert", data: { id: alert.id, title: alert.title } },
                    { status: 201 }
                );
            }

            default:
                return NextResponse.json(
                    { success: false, error: { code: "VALIDATION_ERROR", message: `Unknown type: ${type}. Use "news", "article", or "alert".` } },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("n8n-webhook error:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process webhook" } },
            { status: 500 }
        );
    }
}
