import PptxGenJS from 'pptxgenjs';
import { SlideData, ThemeConfig } from './types';

/**
 * Export slides to PPTX using pptxgenjs native elements
 * This ensures text remains editable in PowerPoint
 */
export async function exportToPptx(
    slides: SlideData[],
    theme: ThemeConfig,
    title: string
): Promise<Buffer> {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 16:9
    pptx.title = title;
    pptx.author = 'SlideForge';

    // Define master slide color
    const { colors } = theme;

    for (const slide of slides) {
        const pptSlide = pptx.addSlide();

        // Background
        if (theme.complexity === 'rich') {
            pptSlide.background = { color: colors.background.replace('#', '') };
            // Decorative accent bar at top
            pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
                x: 0, y: 0, w: 10, h: 0.04,
                fill: { color: hex(colors.primary) },
            });
        } else {
            pptSlide.background = { color: colors.background.replace('#', '') };
        }

        // Add content based on slide type
        switch (slide.type) {
            case 'title':
                addTitleSlide(pptSlide, slide, theme);
                break;
            case 'agenda':
                addAgendaSlide(pptSlide, slide, theme);
                break;
            case 'content':
                addContentSlide(pptSlide, slide, theme);
                break;
            case 'two-column':
            case 'comparison':
                addTwoColumnSlide(pptSlide, slide, theme);
                break;
            case 'chart':
                addChartSlide(pptSlide, slide, theme);
                break;
            case 'image-text':
                addImageTextSlide(pptSlide, slide, theme);
                break;
            case 'summary':
                addSummarySlide(pptSlide, slide, theme);
                break;
            default:
                addContentSlide(pptSlide, slide, theme);
        }

        // Speaker notes
        if (slide.notes) {
            pptSlide.addNotes(slide.notes);
        }

        // Page number
        pptSlide.addText(`${slide.index + 1} / ${slides.length}`, {
            x: 8.5,
            y: 6.8,
            w: 1.5,
            h: 0.3,
            fontSize: 10,
            color: colors.textMuted.replace('#', ''),
            align: 'right',
        });
    }

    const output = await pptx.write({ outputType: 'nodebuffer' });
    return output as Buffer;
}

function hex(color: string): string {
    return color.replace('#', '');
}

function addTitleSlide(
    pptSlide: PptxGenJS.Slide,
    slide: SlideData,
    theme: ThemeConfig
): void {
    const { colors } = theme;

    // Title
    pptSlide.addText(slide.title, {
        x: 1,
        y: 2.2,
        w: 8,
        h: 1.2,
        fontSize: 40,
        fontFace: 'Noto Sans JP',
        bold: true,
        color: hex(colors.text),
        align: 'center',
    });

    // Subtitle
    if (slide.subtitle) {
        pptSlide.addText(slide.subtitle, {
            x: 1,
            y: 3.5,
            w: 8,
            h: 0.8,
            fontSize: 20,
            fontFace: 'Noto Sans JP',
            color: hex(colors.textMuted),
            align: 'center',
        });
    }

    // Accent line
    pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
        x: 3.5,
        y: 3.2,
        w: 3,
        h: 0.05,
        fill: { color: hex(colors.primary) },
    });
}

function addAgendaSlide(
    pptSlide: PptxGenJS.Slide,
    slide: SlideData,
    theme: ThemeConfig
): void {
    const { colors } = theme;

    // Section header
    addSectionHeader(pptSlide, slide.title, theme);

    // Agenda items
    const bullets = slide.bullets || [];
    bullets.forEach((bullet, i) => {
        const y = 1.8 + i * 0.6;

        // Number circle
        pptSlide.addShape('ellipse' as PptxGenJS.ShapeType, {
            x: 0.8,
            y: y,
            w: 0.35,
            h: 0.35,
            fill: { color: hex(colors.primary) },
        });

        pptSlide.addText(String(i + 1), {
            x: 0.8,
            y: y,
            w: 0.35,
            h: 0.35,
            fontSize: 12,
            fontFace: 'Noto Sans JP',
            bold: true,
            color: hex(colors.background),
            align: 'center',
            valign: 'middle',
        });

        pptSlide.addText(bullet, {
            x: 1.3,
            y: y + 0.02,
            w: 7.5,
            h: 0.35,
            fontSize: 16,
            fontFace: 'Noto Sans JP',
            color: hex(colors.text),
        });
    });
}

function addContentSlide(
    pptSlide: PptxGenJS.Slide,
    slide: SlideData,
    theme: ThemeConfig
): void {
    const { colors } = theme;

    addSectionHeader(pptSlide, slide.title, theme);

    const bullets = slide.bullets || [];
    const textItems = bullets.map((b) => ({
        text: b,
        options: {
            bullet: { code: '25CF', color: hex(colors.primary) },
            fontSize: 16,
            color: hex(colors.text),
            spacing: { before: 8, after: 8 },
        },
    }));

    if (textItems.length > 0) {
        pptSlide.addText(textItems as PptxGenJS.TextProps[], {
            x: 0.8,
            y: 1.8,
            w: 8,
            h: 4.5,
            fontFace: 'Noto Sans JP',
            valign: 'top',
        });
    }
}

function addTwoColumnSlide(
    pptSlide: PptxGenJS.Slide,
    slide: SlideData,
    theme: ThemeConfig
): void {
    const { colors } = theme;
    const columns = slide.columns || [];
    const leftCol = columns[0] || { header: '', items: [] };
    const rightCol = columns[1] || { header: '', items: [] };

    addSectionHeader(pptSlide, slide.title, theme);

    // Left column header
    pptSlide.addText(leftCol.header, {
        x: 0.5,
        y: 1.8,
        w: 4.2,
        h: 0.5,
        fontSize: 18,
        fontFace: 'Noto Sans JP',
        bold: true,
        color: hex(colors.primary),
    });

    // Left items
    const leftItems = leftCol.items.map((item) => ({
        text: item,
        options: {
            bullet: { code: '25A0', color: hex(colors.primary) },
            fontSize: 14,
            color: hex(colors.text),
            spacing: { before: 6, after: 6 },
        },
    }));
    if (leftItems.length > 0) {
        pptSlide.addText(leftItems as PptxGenJS.TextProps[], {
            x: 0.5,
            y: 2.4,
            w: 4.2,
            h: 4,
            fontFace: 'Noto Sans JP',
            valign: 'top',
        });
    }

    // Right column header
    pptSlide.addText(rightCol.header, {
        x: 5.3,
        y: 1.8,
        w: 4.2,
        h: 0.5,
        fontSize: 18,
        fontFace: 'Noto Sans JP',
        bold: true,
        color: hex(colors.secondary),
    });

    // Right items
    const rightItems = rightCol.items.map((item) => ({
        text: item,
        options: {
            bullet: { code: '25A0', color: hex(colors.secondary) },
            fontSize: 14,
            color: hex(colors.text),
            spacing: { before: 6, after: 6 },
        },
    }));
    if (rightItems.length > 0) {
        pptSlide.addText(rightItems as PptxGenJS.TextProps[], {
            x: 5.3,
            y: 2.4,
            w: 4.2,
            h: 4,
            fontFace: 'Noto Sans JP',
            valign: 'top',
        });
    }

    // Divider
    pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
        x: 4.9,
        y: 1.8,
        w: 0.02,
        h: 4.5,
        fill: { color: hex(colors.border) },
    });
}

function addChartSlide(
    pptSlide: PptxGenJS.Slide,
    slide: SlideData,
    theme: ThemeConfig
): void {
    const { colors } = theme;
    const chartData = slide.chartData;

    addSectionHeader(pptSlide, slide.title, theme);

    if (chartData && chartData.labels.length > 0) {
        const chartColors = [
            hex(colors.primary),
            hex(colors.secondary),
            hex(colors.accent),
            'F59E0B',
            'EF4444',
            '06B6D4',
        ];

        let chartType: PptxGenJS.CHART_TYPE;
        switch (slide.chartType) {
            case 'pie':
                chartType = 'pie' as PptxGenJS.CHART_TYPE;
                break;
            case 'line':
                chartType = 'line' as PptxGenJS.CHART_TYPE;
                break;
            default:
                chartType = 'bar' as PptxGenJS.CHART_TYPE;
        }

        const chartWidth = slide.bullets && slide.bullets.length > 0 ? 5.5 : 8.5;

        pptSlide.addChart(chartType, [
            {
                name: slide.title,
                labels: chartData.labels,
                values: chartData.values,
            },
        ], {
            x: 0.5,
            y: 1.8,
            w: chartWidth,
            h: 4.5,
            showValue: true,
            chartColors: chartColors.slice(0, chartData.labels.length),
            showLegend: slide.chartType === 'pie',
        });

        // Side bullets
        if (slide.bullets && slide.bullets.length > 0) {
            const bulletItems = slide.bullets.map((b) => ({
                text: b,
                options: {
                    bullet: { code: '25CF', color: hex(colors.primary) },
                    fontSize: 13,
                    color: hex(colors.text),
                    spacing: { before: 6, after: 6 },
                },
            }));

            pptSlide.addText(bulletItems as PptxGenJS.TextProps[], {
                x: 6.3,
                y: 2,
                w: 3.2,
                h: 4,
                fontFace: 'Noto Sans JP',
                valign: 'top',
            });
        }
    }
}

function addImageTextSlide(
    pptSlide: PptxGenJS.Slide,
    slide: SlideData,
    theme: ThemeConfig
): void {
    const { colors } = theme;

    addSectionHeader(pptSlide, slide.title, theme);

    // Left side: embedded image OR key number
    if (slide.imageDataUrl) {
        // Embedded image from reference upload
        pptSlide.addImage({
            data: slide.imageDataUrl,
            x: 0.5,
            y: 1.8,
            w: 4,
            h: 3.5,
            rounding: true,
        });
    } else if (slide.keyNumber) {
        // Key number fallback
        pptSlide.addShape('roundRect' as PptxGenJS.ShapeType, {
            x: 0.5,
            y: 1.8,
            w: 4,
            h: 3.5,
            fill: { color: hex(colors.surface) },
            rectRadius: 0.15,
        });

        pptSlide.addText(slide.keyNumber, {
            x: 0.5,
            y: 2.2,
            w: 4,
            h: 1.5,
            fontSize: 56,
            fontFace: 'Noto Sans JP',
            bold: true,
            color: hex(colors.primary),
            align: 'center',
            valign: 'middle',
        });

        if (slide.keyNumberLabel) {
            pptSlide.addText(slide.keyNumberLabel, {
                x: 0.5,
                y: 3.8,
                w: 4,
                h: 0.5,
                fontSize: 16,
                fontFace: 'Noto Sans JP',
                color: hex(colors.textMuted),
                align: 'center',
            });
        }
    }

    // Bullets on the right
    const bullets = slide.bullets || [];
    if (bullets.length > 0) {
        const bulletItems = bullets.map((b) => ({
            text: b,
            options: {
                bullet: { code: '25CF', color: hex(colors.secondary) },
                fontSize: 14,
                color: hex(colors.text),
                spacing: { before: 6, after: 6 },
            },
        }));

        pptSlide.addText(bulletItems as PptxGenJS.TextProps[], {
            x: 5,
            y: 2,
            w: 4.5,
            h: 4,
            fontFace: 'Noto Sans JP',
            valign: 'top',
        });
    }
}

function addSummarySlide(
    pptSlide: PptxGenJS.Slide,
    slide: SlideData,
    theme: ThemeConfig
): void {
    const { colors } = theme;

    // Centered title
    pptSlide.addText(slide.title, {
        x: 1,
        y: 2,
        w: 8,
        h: 1,
        fontSize: 32,
        fontFace: 'Noto Sans JP',
        bold: true,
        color: hex(colors.text),
        align: 'center',
    });

    // Accent line
    pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
        x: 3,
        y: 2.9,
        w: 4,
        h: 0.04,
        fill: { color: hex(colors.primary) },
    });

    // Bullets
    const bullets = slide.bullets || [];
    if (bullets.length > 0) {
        const bulletItems = bullets.map((b) => ({
            text: b,
            options: {
                bullet: { code: '25A0', color: hex(colors.primary) },
                fontSize: 16,
                color: hex(colors.text),
                spacing: { before: 10, after: 10 },
            },
        }));

        pptSlide.addText(bulletItems as PptxGenJS.TextProps[], {
            x: 2,
            y: 3.2,
            w: 6,
            h: 3.5,
            fontFace: 'Noto Sans JP',
            valign: 'top',
        });
    }
}

function addSectionHeader(
    pptSlide: PptxGenJS.Slide,
    title: string,
    theme: ThemeConfig
): void {
    const { colors } = theme;

    // Accent bar
    pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
        x: 0.5,
        y: 0.7,
        w: 0.05,
        h: 0.4,
        fill: { color: hex(colors.primary) },
    });

    pptSlide.addText(title, {
        x: 0.7,
        y: 0.6,
        w: 8,
        h: 0.6,
        fontSize: 26,
        fontFace: 'Noto Sans JP',
        bold: true,
        color: hex(colors.text),
    });
}
