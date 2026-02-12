import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createGitHubIssue, buildJulesIssueBody, isGitHubConfigured } from "@/lib/github";

const JULES_AGENT_ID = "jules-gh-executor";

// GET: タスク一覧取得
export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                agent: true,
            },
            orderBy: [
                { priority: "asc" },
                { createdAt: "desc" },
            ],
        });
        return NextResponse.json({ data: tasks });
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

// POST: タスク作成（Jules割り当て時はGitHub Issueも自動作成）
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, priority, estimatedMinutes, agentId, agentType } = body;

        // タスクをDBに保存
        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || "medium",
                estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
                agentId: agentId || null,
                agentType: agentType || null,
            },
        });

        // Julesに割り当てられた場合 → GitHub Issueを自動作成
        let githubIssue = null;
        if (agentId === JULES_AGENT_ID && isGitHubConfigured()) {
            try {
                githubIssue = await createGitHubIssue({
                    title: `[Jules] ${title}`,
                    body: buildJulesIssueBody({ title, description, priority }),
                    labels: [priority || "medium"],
                });

                if (githubIssue) {
                    // Issue情報をタスクに紐付け
                    await prisma.task.update({
                        where: { id: task.id },
                        data: {
                            githubIssueNumber: githubIssue.number,
                            githubIssueUrl: githubIssue.html_url,
                            status: "in_progress",
                        },
                    });
                }
            } catch (githubError) {
                console.error("[Jules] GitHub Issue creation failed:", githubError);
                // GitHub連携が失敗してもタスク自体は作成成功として返す
            }
        }

        return NextResponse.json({
            data: { ...task, githubIssue },
            message: githubIssue
                ? `タスク作成完了。GitHub Issue #${githubIssue.number} をJulesに送信しました。`
                : agentId === JULES_AGENT_ID && !isGitHubConfigured()
                    ? "タスク作成完了。GITHUB_TOKENが未設定のため、手動でJulesに割り当ててください。"
                    : "タスク作成完了。",
        });
    } catch (error) {
        console.error("Failed to create task:", error);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
