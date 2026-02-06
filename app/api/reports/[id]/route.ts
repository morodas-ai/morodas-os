import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH: レポートを更新
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, title, description } = body;

        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (title) updateData.title = title;
        if (description) updateData.description = description;

        const report = await prisma.report.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        console.error("Error updating report:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update report" } },
            { status: 500 }
        );
    }
}

// GET: レポート詳細を取得
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const report = await prisma.report.findUnique({
            where: { id },
            include: { agent: { select: { id: true, name: true, type: true } } },
        });

        if (!report) {
            return NextResponse.json(
                { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch report" } },
            { status: 500 }
        );
    }
}
