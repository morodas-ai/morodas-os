import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// n8n Full Publisher Webhook URL (WordPress + 起承転結画像 + X投稿 + Discord通知)
const N8N_PUBLISHER_WEBHOOK = process.env.N8N_PUBLISHER_WEBHOOK
    || "http://133.18.124.53:5678/webhook/morodas-full-publish";

const MORODAS_CALLBACK_BASE = process.env.NEXT_PUBLIC_APP_URL
    || "http://133.18.124.53:3000";

// POST: レビュー済み記事をWordPress+Xに公開
// MORODAS-publisher → MORODAS-x-autoposter の連鎖トリガー
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const idea = await prisma.contentIdea.findUnique({ where: { id } });
        if (!idea) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (!idea.articleBody) {
            return NextResponse.json(
                { error: "記事本文がありません。先にAIで生成してください。" },
                { status: 400 }
            );
        }

        // ステータスを「publishing」に更新
        await prisma.contentIdea.update({
            where: { id },
            data: { status: "publishing" },
        });

        // n8n Publisher Webhook を叩く
        const payload = {
            contentIdeaId: id,
            title: idea.title,
            body: idea.articleBody,
            meta: idea.articleMeta ? JSON.parse(idea.articleMeta) : {},
            keywords: idea.keywords || "",
            autoPostX: true, // X自動投稿もセット
            callbackUrl: `${MORODAS_CALLBACK_BASE}/api/content-studio/${id}/callback`,
            source: "morodas-os",
            requestedAt: new Date().toISOString(),
        };

        fetch(N8N_PUBLISHER_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch((err) => {
            console.error("n8n publisher webhook failed:", err);
            prisma.contentIdea.update({
                where: { id },
                data: { status: "draft" },
            }).catch(() => { });
        });

        return NextResponse.json({
            data: { id, status: "publishing" },
            message: "WordPress公開+X投稿を開始しました。",
        });
    } catch (error) {
        console.error("Failed to trigger publish:", error);
        return NextResponse.json({ error: "Failed to trigger publish" }, { status: 500 });
    }
}
