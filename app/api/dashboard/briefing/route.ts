import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const GEMINI_MODEL = process.env.GEMINI_BRIEFING_MODEL || process.env.GEMINI_MODEL || "gemini-2.0-flash";

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                briefing: "GEMINI_API_KEYが未設定です。.envファイルを確認してください。",
                topTasks: [],
                generatedAt: new Date().toISOString(),
            });
        }

        // 並列でデータ取得
        const [tasks, alerts, monthlyRevenue] = await Promise.all([
            prisma.task.findMany({
                where: { status: { in: ["pending", "in_progress"] } },
                orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
                take: 10,
            }),
            prisma.alert.findMany({
                where: { isDismissed: false },
                take: 5,
            }),
            prisma.monthlyRevenue.findFirst({
                where: {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                },
            }),
        ]);

        if (tasks.length === 0) {
            return NextResponse.json({
                briefing: "現在アクティブなタスクはありません。新しいタスクを追加して、今日の計画を立てましょう。",
                topTasks: [],
                generatedAt: new Date().toISOString(),
            });
        }

        // Gemini でブリーフィング生成
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
        });

        const stagnantAlerts = alerts.filter(a => a.type === "stagnation");
        const today = new Date();
        const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];

        const prompt = `あなたはMORODAS OS のCOOアシスタントです。kazuakiさんの今日の行動を最適化するブリーフィングを生成してください。

【今日の日付】${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${dayOfWeek}）

【未完了タスク一覧】
${tasks.map((t, i) => `${i + 1}. [${t.priority}] ${t.title}${t.dueDate ? ` (期限: ${new Date(t.dueDate).toLocaleDateString("ja-JP")})` : ""}${t.estimatedMinutes ? ` (${t.estimatedMinutes}分)` : ""} — ステータス: ${t.status}`).join("\n")}

【停滞アラート】${stagnantAlerts.length}件
${stagnantAlerts.map(a => `- ${a.title}: ${a.message}`).join("\n") || "なし"}

【今月の収益】¥${(monthlyRevenue?.totalRevenue || 0).toLocaleString()} / 目標¥${(monthlyRevenue?.targetRevenue || 1000000).toLocaleString()}

【指示】
上記の情報から、今日kazuakiさんが集中すべきTOP3のタスクを選び、以下のフォーマットで200文字以内のブリーフィングを生成してください。

ルール:
- Markdown記法は使わない。絵文字で強調する
- 「おはようございます、kazuakiさん。」で始める
- 期限が近いもの・停滞しているものを優先
- 収益目標との関連も一言触れる
- 最後に「推定作業時間: ○分」を付ける`;

        const result = await model.generateContent(prompt);
        const briefing = result.response.text()?.trim() || "ブリーフィングを生成できませんでした。";

        // TOP3タスクを抽出（priority + dueDate考慮）
        const topTasks = tasks
            .sort((a, b) => {
                const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
                const ap = priorityOrder[a.priority] ?? 1;
                const bp = priorityOrder[b.priority] ?? 1;
                if (ap !== bp) return ap - bp;
                // 期限が近い方が先
                if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
                return 0;
            })
            .slice(0, 3)
            .map(t => ({
                ...t,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
                lastActivityAt: t.lastActivityAt.toISOString(),
                dueDate: t.dueDate?.toISOString() || null,
                completedAt: t.completedAt?.toISOString() || null,
            }));

        return NextResponse.json({
            briefing,
            topTasks,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Briefing generation failed:", error);
        return NextResponse.json(
            { error: "ブリーフィング生成に失敗しました", briefing: null, topTasks: [] },
            { status: 500 }
        );
    }
}
