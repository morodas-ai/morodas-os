import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: エージェント一覧
export async function GET() {
    try {
        const agents = await prisma.agent.findMany({ orderBy: { updatedAt: "desc" } });
        return NextResponse.json({ success: true, data: agents });
    } catch (error) {
        console.error("Error fetching agents:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch agents" } },
            { status: 500 }
        );
    }
}

// POST: エージェント作成
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, description, config } = body;

        if (!name || !type) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "name and type are required" } },
                { status: 400 }
            );
        }

        const agent = await prisma.agent.create({
            data: {
                name,
                type,
                description: description || "",
                config: config ? JSON.stringify(config) : "{}",
            },
        });

        return NextResponse.json({ success: true, data: agent }, { status: 201 });
    } catch (error) {
        console.error("Error creating agent:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create agent" } },
            { status: 500 }
        );
    }
}
