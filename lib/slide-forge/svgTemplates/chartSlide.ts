import { SlideData, ThemeConfig } from '../types';
import { escapeXml, sectionHeader, bulletMarker } from './utils';

export function generateChartSlide(slide: SlideData, theme: ThemeConfig): string {
    const { colors, complexity } = theme;
    const chartType = slide.chartType || 'bar';
    const chartData = slide.chartData || { labels: [], values: [] };
    const bullets = slide.bullets || [];

    const chartX = 140;
    const chartY = 240;
    const chartWidth = bullets.length > 0 ? 1000 : 1640;
    const chartHeight = 650;

    let chartContent = '';

    switch (chartType) {
        case 'bar':
            chartContent = generateBarChart(chartData, chartX, chartY, chartWidth, chartHeight, colors, complexity);
            break;
        case 'pie':
            chartContent = generatePieChart(chartData, chartX, chartY, chartWidth, chartHeight, colors);
            break;
        case 'line':
            chartContent = generateLineChart(chartData, chartX, chartY, chartWidth, chartHeight, colors, complexity);
            break;
    }

    // Side bullets (if chart + bullets)
    let sideContent = '';
    if (bullets.length > 0) {
        const sideX = 1220;
        const sideStartY = 320;
        bullets.forEach((bullet, i) => {
            const y = sideStartY + i * 65;
            sideContent += `
        ${bulletMarker(sideX, y + 5, colors.primary)}
        <text x="${sideX + 25}" y="${y + 5}" font-family="'Noto Sans JP', sans-serif"
              font-size="20" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        });
    }

    return `
    ${sectionHeader(slide.title, 160, { primary: colors.primary, text: colors.text })}
    ${chartContent}
    ${sideContent}
  `;
}

function generateBarChart(
    data: { labels: string[]; values: number[]; colors?: string[] },
    x: number, y: number, width: number, height: number,
    colors: ThemeConfig['colors'],
    complexity: string
): string {
    if (data.labels.length === 0) return '';

    const maxVal = Math.max(...data.values, 1);
    const barCount = data.labels.length;
    const gap = 30;
    const barWidth = Math.min(80, (width - gap * (barCount + 1)) / barCount);
    const chartAreaHeight = height - 100;

    // Grid lines
    let grid = '';
    for (let i = 0; i <= 4; i++) {
        const gy = y + 40 + (chartAreaHeight * i) / 4;
        const val = Math.round(maxVal * (1 - i / 4));
        grid += `
      <line x1="${x + 60}" y1="${gy}" x2="${x + width - 20}" y2="${gy}" 
            stroke="${colors.border}" stroke-width="1" stroke-dasharray="4,4" />
      <text x="${x + 50}" y="${gy + 5}" font-family="'Noto Sans JP', sans-serif"
            font-size="14" fill="${colors.textMuted}" text-anchor="end">
        ${val}
      </text>
    `;
    }

    // Bars
    let bars = '';
    const chartColors = data.colors || [colors.primary, colors.secondary, colors.accent, '#F59E0B', '#EF4444', '#06B6D4'];

    data.labels.forEach((label, i) => {
        const barX = x + 80 + i * (barWidth + gap);
        const barHeight = (data.values[i] / maxVal) * chartAreaHeight;
        const barY = y + 40 + chartAreaHeight - barHeight;
        const color = chartColors[i % chartColors.length];

        if (complexity === 'rich') {
            bars += `
        <defs>
          <linearGradient id="barGrad${i}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="1" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.6" />
          </linearGradient>
        </defs>
        <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" 
              rx="6" fill="url(#barGrad${i})" />
      `;
        } else {
            bars += `
        <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" 
              rx="4" fill="${color}" />
      `;
        }

        // Value on top
        bars += `
      <text x="${barX + barWidth / 2}" y="${barY - 10}" font-family="'Noto Sans JP', sans-serif"
            font-size="16" font-weight="700" fill="${colors.text}" text-anchor="middle">
        ${data.values[i]}
      </text>
    `;

        // Label below
        bars += `
      <text x="${barX + barWidth / 2}" y="${y + chartAreaHeight + 70}" 
            font-family="'Noto Sans JP', sans-serif"
            font-size="16" fill="${colors.textMuted}" text-anchor="middle">
        ${escapeXml(label)}
      </text>
    `;
    });

    return `${grid}${bars}`;
}

function generatePieChart(
    data: { labels: string[]; values: number[]; colors?: string[] },
    x: number, y: number, width: number, height: number,
    colors: ThemeConfig['colors']
): string {
    if (data.labels.length === 0) return '';

    const centerX = x + width / 3;
    const centerY = y + height / 2;
    const radius = Math.min(width / 3, height / 2) - 40;
    const total = data.values.reduce((a, b) => a + b, 0) || 1;
    const chartColors = data.colors || [colors.primary, colors.secondary, colors.accent, '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'];

    let paths = '';
    let legendItems = '';
    let currentAngle = -Math.PI / 2;

    data.values.forEach((value, i) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        const color = chartColors[i % chartColors.length];

        const x1 = centerX + radius * Math.cos(currentAngle);
        const y1 = centerY + radius * Math.sin(currentAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        paths += `
      <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z"
            fill="${color}" stroke="${colors.background}" stroke-width="2" />
    `;

        // Legend
        const legendX = x + width * 0.72;
        const legendY = y + 80 + i * 55;
        const pct = Math.round((value / total) * 100);
        legendItems += `
      <rect x="${legendX}" y="${legendY - 10}" width="20" height="20" rx="4" fill="${color}" />
      <text x="${legendX + 30}" y="${legendY + 5}" font-family="'Noto Sans JP', sans-serif"
            font-size="18" fill="${colors.text}">
        ${escapeXml(data.labels[i])} (${pct}%)
      </text>
    `;

        currentAngle = endAngle;
    });

    return `${paths}${legendItems}`;
}

function generateLineChart(
    data: { labels: string[]; values: number[]; colors?: string[] },
    x: number, y: number, width: number, height: number,
    colors: ThemeConfig['colors'],
    complexity: string
): string {
    if (data.labels.length === 0) return '';

    const maxVal = Math.max(...data.values, 1);
    const chartAreaHeight = height - 100;
    const chartAreaWidth = width - 100;
    const pointCount = data.labels.length;

    // Grid
    let grid = '';
    for (let i = 0; i <= 4; i++) {
        const gy = y + 40 + (chartAreaHeight * i) / 4;
        const val = Math.round(maxVal * (1 - i / 4));
        grid += `
      <line x1="${x + 60}" y1="${gy}" x2="${x + width - 20}" y2="${gy}" 
            stroke="${colors.border}" stroke-width="1" stroke-dasharray="4,4" />
      <text x="${x + 50}" y="${gy + 5}" font-family="'Noto Sans JP', sans-serif"
            font-size="14" fill="${colors.textMuted}" text-anchor="end">
        ${val}
      </text>
    `;
    }

    // Points and line
    const points: { px: number; py: number }[] = [];
    data.values.forEach((val, i) => {
        const px = x + 80 + (i / (pointCount - 1 || 1)) * chartAreaWidth;
        const py = y + 40 + chartAreaHeight - (val / maxVal) * chartAreaHeight;
        points.push({ px, py });
    });

    // Line path
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.px} ${p.py}`).join(' ');

    let lineContent = `
    <path d="${pathD}" fill="none" stroke="${colors.primary}" stroke-width="3" 
          stroke-linecap="round" stroke-linejoin="round" />
  `;

    // Area fill for rich mode
    if (complexity === 'rich' && points.length > 1) {
        const areaD = `${pathD} L ${points[points.length - 1].px} ${y + 40 + chartAreaHeight} L ${points[0].px} ${y + 40 + chartAreaHeight} Z`;
        lineContent += `
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${colors.primary}" stop-opacity="0.2" />
          <stop offset="100%" stop-color="${colors.primary}" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#areaGrad)" />
    `;
    }

    // Data points
    let pointsContent = '';
    points.forEach((p, i) => {
        pointsContent += `
      <circle cx="${p.px}" cy="${p.py}" r="6" fill="${colors.primary}" stroke="${colors.background}" stroke-width="2" />
      <text x="${p.px}" y="${p.py - 15}" font-family="'Noto Sans JP', sans-serif"
            font-size="14" font-weight="700" fill="${colors.text}" text-anchor="middle">
        ${data.values[i]}
      </text>
      <text x="${p.px}" y="${y + chartAreaHeight + 70}" font-family="'Noto Sans JP', sans-serif"
            font-size="14" fill="${colors.textMuted}" text-anchor="middle">
        ${escapeXml(data.labels[i])}
      </text>
    `;
    });

    return `${grid}${lineContent}${pointsContent}`;
}
