import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: メトリクスを一括更新（n8nから呼び出し）
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { metrics } = body;

        if (!metrics || !Array.isArray(metrics)) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "metrics array is required" } },
                { status: 400 }
            );
        }

        const updatedMetrics = await Promise.all(
            metrics.map(async (metric: {
                name: string;
                value: number;
                change?: number;
                changePercent?: number;
                target?: number;
            }) => {
                // 既存のメトリクスを検索
                const existing = await prisma.metric.findFirst({
                    where: { name: metric.name },
                    orderBy: { date: "desc" },
                });

                // 変化量を計算（提供されていない場合）
                const change = metric.change ?? (existing ? metric.value - existing.value : 0);
                const changePercent = metric.changePercent ?? (existing && existing.value > 0
                    ? ((metric.value - existing.value) / existing.value) * 100
                    : 0);

                // 新しいメトリクスを作成
                return prisma.metric.create({
                    data: {
                        name: metric.name,
                        value: metric.value,
                        change,
                        changePercent,
                        target: metric.target,
                        date: new Date(),
                    },
                });
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                updated: updatedMetrics.length,
                metrics: updatedMetrics.map(m => ({ name: m.name, value: m.value })),
            },
        });
    } catch (error) {
        console.error("Error updating metrics:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update metrics" } },
            { status: 500 }
        );
    }
}

// GET: 最新のメトリクスを取得
export async function GET() {
    try {
        // 各メトリクスの最新値を取得
        const metrics = await prisma.metric.findMany({
            orderBy: { date: "desc" },
        });

        // 名前でグループ化して最新のみ取得
        const latestMetrics = metrics.reduce((acc, metric) => {
            if (!acc[metric.name]) {
                acc[metric.name] = metric;
            }
            return acc;
        }, {} as Record<string, typeof metrics[0]>);

        return NextResponse.json({
            success: true,
            data: Object.values(latestMetrics),
        });
    } catch (error) {
        console.error("Error fetching metrics:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch metrics" } },
            { status: 500 }
        );
    }
}
