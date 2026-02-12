import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import { getKnowledgeContext } from "@/lib/ojikiKnowledge";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

const SYSTEM_INSTRUCTION = `あなたはMORODAS OS（AI統合マーケティングシステム）のAIアシスタントです。日本語で簡潔かつ的確に回答してください。

【重要な回答ルール】
- Markdown記法（**, *, #, - など）は絶対に使わないでください。
- 箇条書きは使わず、1〜2行の短い段落を改行で区切る「説明文スタイル」で回答してください。
- 強調したい場合は、絵文字（📈✍️💬📊など）を文頭に使ってください。
- 親しみやすく、チャットで話しかけるようなトーンで回答してください。
- 長くなりすぎないよう、要点を絞って回答してください。
- 「ナレッジベース参考情報」が提供された場合は、その内容を踏まえて回答してください。出典がある場合は簡潔に言及してください。`;

// ナレッジ検索を発動するキーワード
const KNOWLEDGE_TRIGGER_KEYWORDS = [
    "ユニコ", "記事", "ナレッジ", "過去の", "前に書いた",
    "note", "ブログ", "バズ", "スキ", "ヒット",
    "書き方", "文体", "トーン", "参考に", "調べて",
];

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
}

/**
 * メッセージがナレッジ検索を必要とするかを判定
 */
function shouldSearchKnowledge(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return KNOWLEDGE_TRIGGER_KEYWORDS.some((kw) => lowerMessage.includes(kw.toLowerCase()));
}

/**
 * Gemini APIでAI応答を生成
 * ナレッジベーストリガーワードを検知した場合、ojiki-knowledge-baseから
 * 関連情報を検索してコンテキストとして注入する（RAG）
 */
export async function generateAIResponse(
    userMessage: string,
    sessionId: string,
    options?: { forceKnowledge?: boolean }
): Promise<string> {
    const client = getClient();
    if (!client) {
        return "⚠️ Gemini APIキーが設定されていません。.envファイルにGEMINI_API_KEYを追加してください。";
    }

    try {
        // ナレッジ検索（RAGコンテキスト注入）
        let knowledgeContext: string | null = null;
        if (options?.forceKnowledge || shouldSearchKnowledge(userMessage)) {
            knowledgeContext = await getKnowledgeContext(userMessage);
        }

        const history = await prisma.message.findMany({
            where: { sessionId },
            orderBy: { createdAt: "asc" },
            take: 20,
        });

        const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        });

        const chat = model.startChat({
            history: history.map((msg: { role: string; content: string }) => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }],
            })),
        });

        // ナレッジコンテキストがある場合はメッセージに付加
        const enrichedMessage = knowledgeContext
            ? `${userMessage}\n${knowledgeContext}`
            : userMessage;

        const result = await chat.sendMessage(enrichedMessage);
        return result.response.text() || "応答を生成できませんでした。";
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "AI接続エラーが発生しました。ネットワーク状態を確認してください。";
    }
}

/**
 * 最初のメッセージからチャットタイトルを自動生成
 */
export async function generateTitle(firstMessage: string): Promise<string> {
    const client = getClient();
    if (!client) return fallbackTitle(firstMessage);

    try {
        const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: { maxOutputTokens: 30, temperature: 0.3 },
        });

        const result = await model.generateContent(
            `次のメッセージに対して、5〜10文字程度の短いチャットタイトルを1つだけ生成してください。説明不要、タイトルのみ回答:\n\n「${firstMessage}」`
        );

        const title = result.response.text()?.trim();
        if (title) return title.replace(/[「」]/g, "").slice(0, 30);
    } catch (error) {
        console.error("Title generation failed:", error);
    }

    return fallbackTitle(firstMessage);
}

/**
 * メッセージのクレンジング（思考ループ対策）
 */
export function cleanMessageContent(content: string): string {
    if (!content) return "";

    let cleaned = content;
    cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, "");
    cleaned = cleaned.replace(/^.*Wait, I'll execute.*$/gim, "");
    cleaned = cleaned.replace(/^.*\(Command: \w+\).*$/gim, "");
    cleaned = cleaned.replace(/^.*Wait\..*$/gim, "");
    cleaned = cleaned.replace(/^.*\(Sending\.\).*$/gim, "");
    cleaned = cleaned.replace(/^.*\(OK\.\).*$/gim, "");
    cleaned = cleaned.replace(/^.*✉️ Message: send.*$/gim, "");
    cleaned = cleaned.replace(/\n\s*\n/g, "\n");

    return cleaned.trim();
}

function fallbackTitle(message: string): string {
    const words = message.replace(/[。、！？]/g, " ").split(/\s+/);
    return words.slice(0, 3).join(" ").slice(0, 20) || "New Chat";
}
