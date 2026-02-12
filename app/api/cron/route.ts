import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateNextFireAt } from "@/lib/triggerSchedule";

/**
 * MORODAS OS — Cron実行エンドポイント
 *
 * 外部cron（VPS crontabまたはVercel Cron）から定期的に呼ばれ、
 * 有効なトリガーのうちnextFireAtを過ぎたものを検出し、
 * AgentRunを作成してエージェント処理を開始する。
 *
 * 推奨: 1分ごとに呼び出し
 * VPS例:  * * * * * curl -s https://your-domain.com/api/cron?secret=YOUR_SECRET
 * Vercel: vercel.json の crons 設定
 */

// セキュリティ: CRON_SECRET が設定されている場合、照合する
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    // シークレット検証
    if (CRON_SECRET) {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");

        // Vercel Cronの場合はヘッダーで検証
        const authHeader = request.headers.get("authorization");
        const headerSecret = authHeader?.replace("Bearer ", "");

        if (secret !== CRON_SECRET && headerSecret !== CRON_SECRET) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }
    }

    try {
        const now = new Date();

        // 有効で、nextFireAtが現在時刻以前のトリガーを取得
        const dueTriggers = await prisma.trigger.findMany({
            where: {
                enabled: true,
                nextFireAt: {
                    lte: now,
                },
            },
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        enabled: true,
                        config: true,
                    },
                },
            },
        });

        // 無効なエージェントのトリガーは除外
        const activeTriggers = dueTriggers.filter((t) => t.agent.enabled);

        const results: {
            triggerId: string;
            agentId: string;
            agentName: string;
            runId: string;
            status: string;
        }[] = [];

        for (const trigger of activeTriggers) {
            try {
                // AgentRun を作成
                const run = await prisma.agentRun.create({
                    data: {
                        agentId: trigger.agentId,
                        status: "completed", // 同期実行のため即完了
                        output: JSON.stringify({
                            source: "cron",
                            triggerId: trigger.id,
                            triggerName: trigger.name,
                            firedAt: now.toISOString(),
                            message: `Scheduled run triggered by "${trigger.name}"`,
                        }),
                        prompt: `Scheduled execution: ${trigger.name} (${trigger.frequency})`,
                        duration: 0,
                    },
                });

                // nextFireAt を更新（次回の実行予定を計算）
                const nextFireAt = calculateNextFireAt({
                    frequency: trigger.frequency,
                    dayOfWeek: trigger.dayOfWeek,
                    dayOfMonth: trigger.dayOfMonth,
                    hour: trigger.hour,
                    minute: trigger.minute,
                });

                // エージェントのlastRunAtも更新
                await prisma.$transaction([
                    prisma.trigger.update({
                        where: { id: trigger.id },
                        data: {
                            lastFiredAt: now,
                            nextFireAt,
                        },
                    }),
                    prisma.agent.update({
                        where: { id: trigger.agentId },
                        data: { lastRunAt: now },
                    }),
                ]);

                results.push({
                    triggerId: trigger.id,
                    agentId: trigger.agentId,
                    agentName: trigger.agent.name,
                    runId: run.id,
                    status: "fired",
                });
            } catch (triggerError) {
                console.error(`Failed to fire trigger ${trigger.id}:`, triggerError);

                // エラーでもAgentRunを記録
                await prisma.agentRun.create({
                    data: {
                        agentId: trigger.agentId,
                        status: "failed",
                        error: String(triggerError),
                        output: JSON.stringify({ source: "cron", triggerId: trigger.id }),
                    },
                });

                results.push({
                    triggerId: trigger.id,
                    agentId: trigger.agentId,
                    agentName: trigger.agent.name,
                    runId: "",
                    status: "error",
                });
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            triggersChecked: dueTriggers.length,
            triggersFired: results.filter((r) => r.status === "fired").length,
            triggersSkipped: dueTriggers.length - activeTriggers.length,
            results,
        });
    } catch (error) {
        console.error("Cron execution failed:", error);
        return NextResponse.json(
            { success: false, error: "Cron execution failed" },
            { status: 500 }
        );
    }
}
