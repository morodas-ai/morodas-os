import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: アラートを作成（n8nから呼び出し）
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, severity, title, message, relatedType, relatedId } = body;

        if (!type || !title || !message) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "type, title, message are required" } },
                { status: 400 }
            );
        }

        // 同じ関連エンティティに対する既存のアラートをチェック
        if (relatedType && relatedId) {
            const existing = await prisma.alert.findFirst({
                where: {
                    relatedType,
                    relatedId,
                    isDismissed: false,
                },
            });

            // 既存のアラートがあれば更新
            if (existing) {
                const updated = await prisma.alert.update({
                    where: { id: existing.id },
                    data: {
                        severity: severity || existing.severity,
                        title,
                        message,
                    },
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        id: updated.id,
                        type: updated.type,
                        severity: updated.severity,
                        updated: true,
                        createdAt: updated.createdAt,
                    },
                });
            }
        }

        // 新規アラートを作成
        const alert = await prisma.alert.create({
            data: {
                type,
                severity: severity || "warning",
                title,
                message,
                relatedType,
                relatedId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: alert.id,
                    type: alert.type,
                    severity: alert.severity,
                    createdAt: alert.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating alert:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create alert" } },
            { status: 500 }
        );
    }
}

// GET: アラート一覧を取得
export async function GET() {
    try {
        const alerts = await prisma.alert.findMany({
            where: {
                isDismissed: false,
            },
            orderBy: [
                { severity: "desc" },
                { createdAt: "desc" },
            ],
        });

        return NextResponse.json({ success: true, data: alerts });
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch alerts" } },
            { status: 500 }
        );
    }
}

// PATCH: アラートを既読/非表示にする
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, isRead, isDismissed } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "id is required" } },
                { status: 400 }
            );
        }

        const alert = await prisma.alert.update({
            where: { id },
            data: {
                ...(isRead !== undefined && { isRead }),
                ...(isDismissed !== undefined && { isDismissed }),
                ...(isDismissed && { resolvedAt: new Date() }),
            },
        });

        return NextResponse.json({ success: true, data: alert });
    } catch (error) {
        console.error("Error updating alert:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update alert" } },
            { status: 500 }
        );
    }
}
