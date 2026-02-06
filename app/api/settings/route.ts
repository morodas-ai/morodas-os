import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: 設定一覧
export async function GET() {
    try {
        const settings = await prisma.setting.findMany();
        const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
        return NextResponse.json({ success: true, data: settingsMap });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch settings" } },
            { status: 500 }
        );
    }
}

// POST: 設定更新（upsert）
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { key, value, description } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "key and value are required" } },
                { status: 400 }
            );
        }

        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description },
        });

        return NextResponse.json({ success: true, data: setting });
    } catch (error) {
        console.error("Error updating setting:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update setting" } },
            { status: 500 }
        );
    }
}
