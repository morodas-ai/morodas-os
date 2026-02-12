import { NextRequest, NextResponse } from 'next/server';
import { regenerateSingleSlide } from '@/lib/slide-forge/aiAnalyzer';
import { generateSlideSVG } from '@/lib/slide-forge/svgEngine';
import { getTheme } from '@/lib/slide-forge/themes';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slide, allSlides, excelData, config } = body;

        if (!slide || !allSlides || !excelData || !config) {
            return NextResponse.json(
                { success: false, error: '必要なデータが不足しています' },
                { status: 400 }
            );
        }

        const newSlide = await regenerateSingleSlide(slide, allSlides, excelData, config);
        const theme = getTheme(config.themeName || 'corporate-blue', config.complexity);
        const svg = generateSlideSVG(newSlide, theme, allSlides.length);

        return NextResponse.json({
            success: true,
            slide: newSlide,
            svg,
        });
    } catch (error) {
        console.error('Slide regeneration error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'スライドの再生成に失敗しました',
            },
            { status: 500 }
        );
    }
}
