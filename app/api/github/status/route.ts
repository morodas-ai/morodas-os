import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: GitHub設定状態を返す
export async function GET() {
    return NextResponse.json({
        configured: !!process.env.GITHUB_TOKEN,
        owner: process.env.GITHUB_OWNER || "morodas-ai",
        repo: process.env.GITHUB_REPO || "morodas-os",
    });
}
