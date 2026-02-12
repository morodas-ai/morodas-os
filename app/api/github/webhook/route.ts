import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GitHub Webhook受信 - JulesのPR完了通知を処理
export async function POST(req: Request) {
    try {
        const event = req.headers.get("x-github-event");
        const body = await req.json();

        // Issue closedイベント → タスクを完了にする
        if (event === "issues" && body.action === "closed") {
            const issueNumber = body.issue?.number;
            if (!issueNumber) return NextResponse.json({ ok: true });

            const task = await prisma.task.findFirst({
                where: { githubIssueNumber: issueNumber },
            });

            if (task) {
                await prisma.task.update({
                    where: { id: task.id },
                    data: {
                        status: "done",
                        completedAt: new Date(),
                    },
                });
                console.log(`[Webhook] Task "${task.title}" marked as done (Issue #${issueNumber} closed)`);
            }
        }

        // PR mergedイベント → タスクを完了にする
        if (event === "pull_request" && body.action === "closed" && body.pull_request?.merged) {
            // PRのbodyからIssue番号を抽出（"Closes #123" パターン）
            const prBody = body.pull_request?.body || "";
            const issueMatch = prBody.match(/(?:closes|fixes|resolves)\s+#(\d+)/i);

            if (issueMatch) {
                const issueNumber = parseInt(issueMatch[1]);
                const task = await prisma.task.findFirst({
                    where: { githubIssueNumber: issueNumber },
                });

                if (task) {
                    await prisma.task.update({
                        where: { id: task.id },
                        data: {
                            status: "done",
                            completedAt: new Date(),
                        },
                    });
                    console.log(`[Webhook] Task "${task.title}" marked as done (PR merged for Issue #${issueNumber})`);
                }
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[Webhook] Error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
