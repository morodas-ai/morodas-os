
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const interviewCase = await prisma.interviewCase.findUnique({
            where: { id },
        });

        if (!interviewCase) {
            return NextResponse.json(
                { error: 'Interview case not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(interviewCase);
    } catch (error) {
        console.error('Error fetching interview case:', error);
        return NextResponse.json(
            { error: 'Failed to fetch interview case' },
            { status: 500 }
        );
    }
}
