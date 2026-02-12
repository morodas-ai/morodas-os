import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateAIResponse, generateTitle, cleanMessageContent } from "@/lib/gemini";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        let { id: sessionId } = await params;

        // "global" セッションの自動作成/取得
        if (sessionId === "global") {
            let globalSession = await prisma.chatSession.findFirst({
                where: { title: "__global_assistant__" },
            });
            if (!globalSession) {
                globalSession = await prisma.chatSession.create({
                    data: { title: "__global_assistant__", context: "Global AI Assistant" },
                });
            }
            sessionId = globalSession.id;
        }

        const body = await request.json();
        const { content, role } = body;
        const cleanedContent = cleanMessageContent(content);

        if (!cleanedContent) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "content is required" } },
                { status: 400 }
            );
        }

        // ユーザーメッセージを保存
        const userMessage = await prisma.message.create({
            data: { sessionId, role: role || "user", content: cleanedContent },
        });

        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        // AI応答を生成・保存
        const rawAiResponse = await generateAIResponse(cleanedContent, sessionId);
        const aiResponse = cleanMessageContent(rawAiResponse);

        let assistantMessage;
        if (aiResponse) {
            assistantMessage = await prisma.message.create({
                data: { sessionId, role: "assistant", content: aiResponse },
            });
        }

        // 最初のメッセージの場合、タイトルを自動生成
        const messageCount = await prisma.message.count({ where: { sessionId } });
        if (messageCount <= 2) {
            const title = await generateTitle(cleanedContent);
            await prisma.chatSession.update({
                where: { id: sessionId },
                data: { title },
            });
        }

        return NextResponse.json({
            success: true,
            data: { userMessage, assistantMessage: assistantMessage || null },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to send message" } },
            { status: 500 }
        );
    }
}
