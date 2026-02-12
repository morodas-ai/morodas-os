
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            title,
            jobPosting,
            resume,
            personaNote,
            jobCategory,
            interviewFormat
        } = body;

        // バリデーション
        if (!title || !jobPosting || !resume || !jobCategory || !interviewFormat) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newCase = await prisma.interviewCase.create({
            data: {
                title,
                jobPosting,
                resume,
                personaNote,
                jobCategory,
                interviewFormat,
                status: 'draft',
            },
        });

        return NextResponse.json(newCase);
    } catch (error) {
        console.error('Error creating interview case:', error);
        return NextResponse.json(
            { error: 'Failed to create interview case' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cases = await prisma.interviewCase.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(cases);
    } catch (error) {
        console.error('Error fetching interview cases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch interview cases' },
            { status: 500 }
        );
    }
}
