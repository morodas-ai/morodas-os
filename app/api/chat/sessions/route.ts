import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: セッション一覧
export async function GET() {
    try {
        const sessions = await prisma.chatSession.findMany({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: sessions.map((s) => ({
                id: s.id,
                title: s.title,
                lastMessage: s.messages[0]?.content?.slice(0, 50) || "",
                updatedAt: s.updatedAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch sessions" } },
            { status: 500 }
        );
    }
}

// POST: 新規セッション作成
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { title, context } = body;

        const session = await prisma.chatSession.create({
            data: {
                title: title || "New Chat",
                context,
            },
        });

        return NextResponse.json({ success: true, data: session }, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create session" } },
            { status: 500 }
        );
    }
}
