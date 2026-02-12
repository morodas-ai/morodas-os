import { NextRequest, NextResponse } from 'next/server';
import { exportToPptx } from '@/lib/slide-forge/pptxExporter';
import { getTheme } from '@/lib/slide-forge/themes';
import { ExportPptxRequest } from '@/lib/slide-forge/types';

export async function POST(request: NextRequest) {
    try {
        const body: ExportPptxRequest = await request.json();
        const { slides, theme: themeConfig, title } = body;

        if (!slides || slides.length === 0) {
            return NextResponse.json(
                { success: false, error: 'スライドデータがありません' },
                { status: 400 }
            );
        }

        const theme = themeConfig || getTheme('corporate-blue', 'standard');
        const pptxBuffer = await exportToPptx(slides, theme, title || 'Presentation');
        const uint8 = new Uint8Array(pptxBuffer);

        return new NextResponse(uint8, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(title || 'presentation')}.pptx"`,
            },
        });
    } catch (error) {
        console.error('PPTX export error:', error);
        return NextResponse.json(
            { success: false, error: 'PPTXエクスポートに失敗しました' },
            { status: 500 }
        );
    }
}
