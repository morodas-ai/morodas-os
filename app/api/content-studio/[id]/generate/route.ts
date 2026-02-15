import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// n8n Article Generator Webhook URL（trigger-article.shと同じエンドポイント）
const N8N_ARTICLE_WEBHOOK = process.env.N8N_ARTICLE_GENERATOR_WEBHOOK
    || "http://133.18.124.53:5678/webhook/morodas-article-generator";

const MORODAS_CALLBACK_BASE = process.env.NEXT_PUBLIC_APP_URL
    || "http://133.18.124.53:3000";

// POST: n8n Article Generator をトリガー
// trigger-article.sh と同じペイロード形式でWebhookを叩く
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // 1. ContentIdeaを取得
        const idea = await prisma.contentIdea.findUnique({ where: { id } });
        if (!idea) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // 1.5 二重実行防止
        if (idea.status === "generating" || idea.status === "publishing") {
            return NextResponse.json(
                { error: `現在${idea.status === "generating" ? "生成" : "公開"}中です。完了をお待ちください。` },
                { status: 409 }
            );
        }

        // 2. ステータスを「generating」に更新
        await prisma.contentIdea.update({
            where: { id },
            data: { status: "generating" },
        });

        // 3. trigger-article.sh 互換のペイロードを組み立て
        //    + MORODAS専用のコールバックURLを追加
        const payload = {
            // --- trigger-article.sh 互換フィールド ---
            theme: idea.title,
            angle: idea.angle || "",
            keywords: idea.keywords || "",
            cta: "none",
            tone: "informative",
            wordCount: 4000,
            requestedAt: new Date().toISOString(),
            source: "morodas-os",

            // --- MORODAS追加フィールド ---
            contentIdeaId: id,
            callbackUrl: `${MORODAS_CALLBACK_BASE}/api/content-studio/${id}/callback`,
        };

        // 4. n8n Webhookを叩く（非同期 — UIをブロックしない）
        fetch(N8N_ARTICLE_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch((err) => {
            console.error("n8n webhook trigger failed:", err);
            // Webhookが失敗した場合はステータスをerrorに設定
            prisma.contentIdea.update({
                where: { id },
                data: {
                    status: "error",
                    articleMeta: JSON.stringify({ error: `n8n接続エラー: ${err.message}` }),
                },
            }).catch(() => { });
        });

        return NextResponse.json({
            data: { id, status: "generating" },
            message: "記事生成を開始しました。完了するとコンテンツスタジオに表示されます。",
            webhook: N8N_ARTICLE_WEBHOOK,
        });
    } catch (error) {
        console.error("Failed to trigger generation:", error);
        return NextResponse.json({ error: "Failed to trigger generation" }, { status: 500 });
    }
}
