import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: メッセージ送信
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;
        const body = await request.json();
        const { content, role } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "content is required" } },
                { status: 400 }
            );
        }

        // ユーザーメッセージを保存
        const userMessage = await prisma.message.create({
            data: {
                sessionId,
                role: role || "user",
                content,
            },
        });

        // セッションの更新日時を更新
        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        // TODO: ここでGemini API呼び出しを行う
        // 現在はダミー応答
        const aiResponse = await generateAIResponse(content, sessionId);

        // AI応答を保存
        const assistantMessage = await prisma.message.create({
            data: {
                sessionId,
                role: "assistant",
                content: aiResponse,
            },
        });

        // 最初のメッセージの場合、タイトルを自動生成
        const messageCount = await prisma.message.count({ where: { sessionId } });
        if (messageCount <= 2) {
            const title = await generateTitle(content);
            await prisma.chatSession.update({
                where: { id: sessionId },
                data: { title },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                userMessage,
                assistantMessage,
            },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to send message" } },
            { status: 500 }
        );
    }
}

// ダミーAI応答（後でGemini API連携）
async function generateAIResponse(userMessage: string, sessionId: string): Promise<string> {
    // TODO: Gemini API連携
    // const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", {...});

    // 現在はダミー応答
    await new Promise((resolve) => setTimeout(resolve, 500)); // 遅延シミュレーション

    const responses = [
        `了解しました。「${userMessage.slice(0, 20)}...」について考えてみましょう。`,
        "興味深い質問ですね。詳しく分析してみます。",
        "MORODASのAIアシスタントです。どのようにお手伝いできますか？",
        "その件について、いくつかの視点から検討してみましょう。",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

// タイトル自動生成
async function generateTitle(firstMessage: string): Promise<string> {
    // TODO: Gemini APIでタイトル生成
    // プロンプト: 「この会話に5文字以内でタイトルをつけて」

    // 現在は最初のメッセージから抽出
    const words = firstMessage.replace(/[。、！？]/g, " ").split(/\s+/);
    return words.slice(0, 3).join(" ").slice(0, 20) || "New Chat";
}
