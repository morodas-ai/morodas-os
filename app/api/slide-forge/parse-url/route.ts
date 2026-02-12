import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

// Simple HTML parser without cheerio dependency
function extractText(html: string): { title: string; sections: { heading: string; content: string[] }[] } {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = stripTags(titleMatch?.[1] || h1Match?.[1] || '').trim();

    // Remove script, style, nav, footer, header, aside elements
    let cleaned = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
        .replace(/<form[\s\S]*?<\/form>/gi, '');

    // Try to find main content area
    const mainMatch = cleaned.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i)
        || cleaned.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
    if (mainMatch) {
        cleaned = mainMatch[1];
    } else {
        const bodyMatch = cleaned.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
        if (bodyMatch) cleaned = bodyMatch[1];
    }

    // Extract sections by headings
    const sections: { heading: string; content: string[] }[] = [];
    // Split by headings
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let lastIndex = 0;
    let currentHeading = title || 'メインコンテンツ';
    let currentContent: string[] = [];
    let match;

    // First, collect content before any heading
    const firstHeadingMatch = headingRegex.exec(cleaned);
    if (firstHeadingMatch && firstHeadingMatch.index > 0) {
        const beforeContent = extractParagraphs(cleaned.substring(0, firstHeadingMatch.index));
        if (beforeContent.length > 0) {
            sections.push({ heading: currentHeading, content: beforeContent });
        }
        currentHeading = stripTags(firstHeadingMatch[2]).trim();
        lastIndex = firstHeadingMatch.index + firstHeadingMatch[0].length;
    } else if (!firstHeadingMatch) {
        // No headings found at all
        const allContent = extractParagraphs(cleaned);
        if (allContent.length > 0) {
            sections.push({ heading: currentHeading, content: allContent });
        }
        return { title: title || 'Untitled', sections };
    } else {
        currentHeading = stripTags(firstHeadingMatch[2]).trim();
        lastIndex = firstHeadingMatch.index + firstHeadingMatch[0].length;
    }

    // Reset regex
    headingRegex.lastIndex = lastIndex;

    while ((match = headingRegex.exec(cleaned)) !== null) {
        const betweenContent = extractParagraphs(cleaned.substring(lastIndex, match.index));
        if (betweenContent.length > 0 || currentHeading) {
            sections.push({ heading: currentHeading, content: betweenContent });
        }
        currentHeading = stripTags(match[2]).trim();
        lastIndex = match.index + match[0].length;
    }

    // Last section
    const remainingContent = extractParagraphs(cleaned.substring(lastIndex));
    if (remainingContent.length > 0 || currentHeading) {
        sections.push({ heading: currentHeading, content: remainingContent });
    }

    return { title: title || 'Untitled', sections: sections.slice(0, 15) };
}

function extractParagraphs(html: string): string[] {
    const results: string[] = [];
    // Match p, li, td, blockquote
    const regex = /<(?:p|li|td|th|blockquote|pre)[^>]*>([\s\S]*?)<\/(?:p|li|td|th|blockquote|pre)>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const text = stripTags(match[1]).trim().replace(/\s+/g, ' ');
        if (text.length >= 3) {
            results.push(text.length > 200 ? text.substring(0, 200) + '...' : text);
        }
    }
    // If no structured elements found, just strip all tags
    if (results.length === 0) {
        const plainText = stripTags(html).trim().replace(/\s+/g, ' ');
        if (plainText.length > 10) {
            const chunks = plainText.match(/.{1,200}/g);
            return chunks?.slice(0, 10) || [];
        }
    }
    return results.slice(0, 30);
}

function stripTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { success: false, error: 'URLが指定されていません' },
                { status: 400 }
            );
        }

        // Validate URL
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error('Invalid protocol');
            }
        } catch {
            return NextResponse.json(
                { success: false, error: '無効なURLです。http:// または https:// で始まるURLを入力してください' },
                { status: 400 }
            );
        }

        // Fetch the page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SlideForge/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `ページの取得に失敗しました (HTTP ${response.status})` },
                { status: 400 }
            );
        }

        const html = await response.text();
        const { title: pageTitle, sections } = extractText(html);
        const displayTitle = pageTitle || parsedUrl.hostname;

        if (sections.length === 0) {
            return NextResponse.json(
                { success: false, error: 'ページからコンテンツを抽出できませんでした' },
                { status: 400 }
            );
        }

        // Build text summary
        const textSummary = sections
            .map(s => `【${s.heading}】\n${s.content.join('\n')}`)
            .join('\n\n');

        // Convert to ParsedExcel format
        const parsedExcel = {
            fileName: `${displayTitle}.url`,
            sheets: [{
                name: displayTitle,
                headers: ['見出し', '内容'],
                rows: sections.flatMap(s =>
                    s.content.length > 0
                        ? s.content.map((c, i) => ({
                            '見出し': i === 0 ? s.heading : '',
                            '内容': c,
                        }))
                        : [{ '見出し': s.heading, '内容': '' }]
                ),
                rowCount: sections.reduce((a, s) => a + Math.max(s.content.length, 1), 0),
            }],
            textSummary: `URL: ${url}\n\n${textSummary}`,
        };

        return NextResponse.json({
            success: true,
            data: parsedExcel,
            title: displayTitle,
        });
    } catch (error) {
        console.error('URL parse error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'URLの解析に失敗しました',
            },
            { status: 500 }
        );
    }
}
