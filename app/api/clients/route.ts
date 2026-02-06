import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: クライアント一覧
export async function GET() {
    try {
        const clients = await prisma.client.findMany({ orderBy: { updatedAt: "desc" } });
        return NextResponse.json({ success: true, data: clients });
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch clients" } },
            { status: 500 }
        );
    }
}

// POST: クライアント作成
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, company, email, phone, stage, dealValue, probability, nextAction, dueDate, notes } = body;

        if (!name || !company) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "name and company are required" } },
                { status: 400 }
            );
        }

        const client = await prisma.client.create({
            data: {
                name,
                company,
                email,
                phone,
                stage: stage || "lead",
                dealValue,
                probability,
                nextAction,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                notes,
            },
        });

        return NextResponse.json({ success: true, data: client }, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create client" } },
            { status: 500 }
        );
    }
}

// PATCH: クライアント更新（ステージ変更など）
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "id is required" } },
                { status: 400 }
            );
        }

        if (updateData.dueDate) {
            updateData.dueDate = new Date(updateData.dueDate);
        }

        const client = await prisma.client.update({ where: { id }, data: updateData });
        return NextResponse.json({ success: true, data: client });
    } catch (error) {
        console.error("Error updating client:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update client" } },
            { status: 500 }
        );
    }
}

// DELETE: クライアント削除
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: { code: "VALIDATION_ERROR", message: "id is required" } },
                { status: 400 }
            );
        }

        await prisma.client.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Client deleted" });
    } catch (error) {
        console.error("Error deleting client:", error);
        return NextResponse.json(
            { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete client" } },
            { status: 500 }
        );
    }
}
