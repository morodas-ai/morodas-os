import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 全ツール一覧
export async function GET() {
    try {
        const tools = await prisma.tool.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json({ data: tools });
    } catch (error) {
        console.error("Failed to fetch tools:", error);
        return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 });
    }
}

// POST: ツール作成（管理者用）
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, provider, icon, description } = body;

        const tool = await prisma.tool.create({
            data: {
                name,
                provider,
                icon,
                description,
            },
        });

        return NextResponse.json({ data: tool }, { status: 201 });
    } catch (error) {
        console.error("Failed to create tool:", error);
        return NextResponse.json({ error: "Failed to create tool" }, { status: 500 });
    }
}
