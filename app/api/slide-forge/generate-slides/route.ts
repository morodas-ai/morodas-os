import { NextRequest, NextResponse } from 'next/server';
import { analyzeAndGenerateSlides } from '@/lib/slide-forge/aiAnalyzer';
import { generateAllSlidesSVG } from '@/lib/slide-forge/svgEngine';
import { getTheme } from '@/lib/slide-forge/themes';
import { GenerateSlidesRequest, ReferenceImage } from '@/lib/slide-forge/types';

export const maxDuration = 60; // Allow up to 60s for AI processing

export async function POST(request: NextRequest) {
    try {
        const body: GenerateSlidesRequest = await request.json();
        const { excelData, config, referenceImages } = body;

        if (!excelData || !config) {
            return NextResponse.json(
                { success: false, error: '必要なデータが不足しています' },
                { status: 400 }
            );
        }

        // Cap reference images at 5
        const cappedImages = referenceImages?.slice(0, 5);

        // Extract descriptions for AI prompt
        const descriptions = cappedImages
            ?.map((img: ReferenceImage) => img.description)
            .filter((d: string) => d.trim().length > 0);

        // Generate slide structure via AI
        const slides = await analyzeAndGenerateSlides(
            excelData,
            config,
            descriptions && descriptions.length > 0 ? descriptions : undefined
        );

        // Assign uploaded images to slides
        if (cappedImages && cappedImages.length > 0) {
            // Find existing image-text slides
            let imageTextSlides = slides.filter((s) => s.type === 'image-text');

            // If AI didn't create enough image-text slides, convert content slides
            const shortage = cappedImages.length - imageTextSlides.length;
            if (shortage > 0) {
                // Find content slides we can convert (skip first 2 slides: title + agenda)
                const convertibleSlides = slides
                    .filter((s, idx) => idx >= 2 && s.type === 'content' && !imageTextSlides.includes(s))
                    .slice(0, shortage);

                for (const slide of convertibleSlides) {
                    slide.type = 'image-text';
                }

                // Refresh the list
                imageTextSlides = slides.filter((s) => s.type === 'image-text');
            }

            // Distribute images across image-text slides
            cappedImages.forEach((img, i) => {
                if (i < imageTextSlides.length) {
                    imageTextSlides[i].imageDataUrl = img.dataUrl;
                }
            });
        }

        // Get theme and generate SVGs
        const theme = getTheme(config.themeName || 'corporate-blue', config.complexity);
        const svgs = generateAllSlidesSVG(slides, theme);

        return NextResponse.json({
            success: true,
            slides,
            svgs,
        });
    } catch (error) {
        console.error('Slide generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'スライド生成に失敗しました',
            },
            { status: 500 }
        );
    }
}
