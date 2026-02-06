import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: 収益を登録（n8nから呼び出し）
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, source, description, date, clientId } = body;

        if (!amount || !source) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "amount and source are required" } },
                { status: 400 }
            );
        }

        // 収益を作成
        const revenue = await prisma.revenue.create({
            data: {
                amount,
                source,
                description,
                date: date ? new Date(date) : new Date(),
                clientId,
            },
        });

        // 月次収益を更新
        const revenueDate = new Date(revenue.date);
        const year = revenueDate.getFullYear();
        const month = revenueDate.getMonth() + 1;

        let monthlyRevenue = await prisma.monthlyRevenue.findFirst({
            where: { year, month },
        });

        if (!monthlyRevenue) {
            monthlyRevenue = await prisma.monthlyRevenue.create({
                data: { year, month, targetRevenue: 1000000 },
            });
        }

        // 収益源に応じてフィールドを更新
        const updateData: Record<string, number> = {
            totalRevenue: monthlyRevenue.totalRevenue + amount,
        };

        switch (source) {
            case "note":
                updateData.noteRevenue = monthlyRevenue.noteRevenue + amount;
                break;
            case "consulting":
                updateData.consultingRevenue = monthlyRevenue.consultingRevenue + amount;
                break;
            case "development":
                updateData.developmentRevenue = monthlyRevenue.developmentRevenue + amount;
                break;
            default:
                updateData.otherRevenue = monthlyRevenue.otherRevenue + amount;
        }

        await prisma.monthlyRevenue.update({
            where: { id: monthlyRevenue.id },
            data: updateData,
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: revenue.id,
                    amount: revenue.amount,
                    source: revenue.source,
                    monthlyTotal: updateData.totalRevenue,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating revenue:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create revenue" } },
            { status: 500 }
        );
    }
}

// GET: 収益データを取得
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());

        // 月次収益を取得
        const monthlyRevenue = await prisma.monthlyRevenue.findFirst({
            where: { year, month },
        });

        // 個別収益を取得
        const revenues = await prisma.revenue.findMany({
            where: {
                date: {
                    gte: new Date(year, month - 1, 1),
                    lt: new Date(year, month, 1),
                },
            },
            orderBy: { date: "desc" },
        });

        return NextResponse.json({
            success: true,
            data: {
                monthly: monthlyRevenue,
                transactions: revenues,
            },
        });
    } catch (error) {
        console.error("Error fetching revenue:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch revenue" } },
            { status: 500 }
        );
    }
}
