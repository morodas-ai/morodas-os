import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
    try {
        const { svgs, title } = await request.json();

        if (!svgs || !Array.isArray(svgs) || svgs.length === 0) {
            return NextResponse.json(
                { success: false, error: 'SVGデータが不足しています' },
                { status: 400 }
            );
        }

        // Build a simple HTML that contains all SVGs as pages
        // Using print-ready CSS to create a proper multi-page PDF
        const pages = svgs.map((svg: string, i: number) => `
            <div class="page" ${i > 0 ? '' : ''}>
                ${svg}
            </div>
        `).join('\n');

        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@page {
    size: 1920px 1080px;
    margin: 0;
}
* { margin: 0; padding: 0; }
body { margin: 0; }
.page {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    overflow: hidden;
}
.page:last-child {
    page-break-after: auto;
}
svg {
    width: 1920px;
    height: 1080px;
    display: block;
}
</style>
</head>
<body>
${pages}
</body>
</html>`;

        // Return the HTML for client-side PDF rendering via print
        return NextResponse.json({
            success: true,
            html,
            title: title || 'Presentation',
        });
    } catch (error) {
        console.error('PDF export error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'PDF生成に失敗しました',
            },
            { status: 500 }
        );
    }
}
