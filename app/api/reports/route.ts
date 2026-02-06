import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: レポートを作成（n8nから呼び出し）
export async function POST(request: Request) {
    try {
        // API Key認証（本番では必須）
        const apiKey = request.headers.get("X-API-Key");
        // TODO: 本番環境では process.env.MORODAS_API_KEY と比較

        const body = await request.json();
        const { agentType, title, description, status, workspace, content } = body;

        // バリデーション
        if (!agentType || !title || !description) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "agentType, title, description are required" } },
                { status: 400 }
            );
        }

        // エージェントを検索（なければ作成）
        let agent = await prisma.agent.findFirst({
            where: { type: agentType },
        });

        if (!agent) {
            agent = await prisma.agent.create({
                data: {
                    name: `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`,
                    type: agentType,
                    description: `Auto-created agent for ${agentType}`,
                    config: "{}",
                },
            });
        }

        // エージェントの最終実行時刻を更新
        await prisma.agent.update({
            where: { id: agent.id },
            data: { lastRunAt: new Date() },
        });

        // レポートを作成
        const report = await prisma.report.create({
            data: {
                agentId: agent.id,
                title,
                description,
                status: status || "review",
                workspace: workspace || "Default Workspace",
                content: typeof content === "string" ? content : JSON.stringify(content),
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: report.id,
                    agentId: report.agentId,
                    title: report.title,
                    status: report.status,
                    createdAt: report.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create report" } },
            { status: 500 }
        );
    }
}

// GET: レポート一覧を取得
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const agentType = searchParams.get("agentType");

        const where: Record<string, unknown> = {};

        if (status && status !== "all") {
            where.status = status;
        }

        if (agentType) {
            where.agent = { type: agentType };
        }

        const reports = await prisma.report.findMany({
            where,
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ success: true, data: reports });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch reports" } },
            { status: 500 }
        );
    }
}
