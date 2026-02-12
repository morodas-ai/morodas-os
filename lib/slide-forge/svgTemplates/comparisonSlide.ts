import { SlideData, ThemeConfig } from '../types';
import { escapeXml, sectionHeader } from './utils';

export function generateComparisonSlide(slide: SlideData, theme: ThemeConfig): string {
    const { colors, complexity } = theme;
    const columns = slide.columns || [];
    const leftCol = columns[0] || { header: '', items: [] };
    const rightCol = columns[1] || { header: '', items: [] };

    const colWidth = 780;
    const leftX = 100;
    const rightX = 1000;
    const headerY = 270;
    const itemStartY = 360;
    const lineHeight = 70;

    // VS badge in center
    const vsBadge = complexity !== 'simple' ? `
    <circle cx="960" cy="${headerY - 5}" r="30" fill="${colors.primary}" />
    <text x="960" y="${headerY + 5}" font-family="'Noto Sans JP', sans-serif" 
          font-size="18" font-weight="700" fill="${colors.background}" text-anchor="middle">
      VS
    </text>
  ` : '';

    // Column backgrounds
    let colBg = '';
    if (complexity === 'rich') {
        colBg = `
      <rect x="${leftX}" y="220" width="${colWidth}" height="780" rx="16" 
            fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
      <rect x="${rightX}" y="220" width="${colWidth}" height="780" rx="16" 
            fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
    `;
    }

    // Headers
    const headers = `
    <text x="${leftX + colWidth / 2}" y="${headerY}" font-family="'Noto Sans JP', sans-serif"
          font-size="30" font-weight="700" fill="${colors.primary}" text-anchor="middle">
      ${escapeXml(leftCol.header)}
    </text>
    <rect x="${leftX + 100}" y="${headerY + 12}" width="${colWidth - 200}" height="3" rx="1.5" fill="${colors.primary}" opacity="0.3" />
    <text x="${rightX + colWidth / 2}" y="${headerY}" font-family="'Noto Sans JP', sans-serif"
          font-size="30" font-weight="700" fill="${colors.secondary}" text-anchor="middle">
      ${escapeXml(rightCol.header)}
    </text>
    <rect x="${rightX + 100}" y="${headerY + 12}" width="${colWidth - 200}" height="3" rx="1.5" fill="${colors.secondary}" opacity="0.3" />
  `;

    // Items
    let items = '';
    const maxItems = Math.max(leftCol.items.length, rightCol.items.length);

    for (let i = 0; i < maxItems; i++) {
        const y = itemStartY + i * lineHeight;

        if (i < leftCol.items.length) {
            items += `
        <rect x="${leftX + 30}" y="${y - 8}" width="8" height="8" rx="2" fill="${colors.primary}" />
        <text x="${leftX + 55}" y="${y}" font-family="'Noto Sans JP', sans-serif"
              font-size="22" fill="${colors.text}">
          ${escapeXml(leftCol.items[i])}
        </text>
      `;
        }

        if (i < rightCol.items.length) {
            items += `
        <rect x="${rightX + 30}" y="${y - 8}" width="8" height="8" rx="2" fill="${colors.secondary}" />
        <text x="${rightX + 55}" y="${y}" font-family="'Noto Sans JP', sans-serif"
              font-size="22" fill="${colors.text}">
          ${escapeXml(rightCol.items[i])}
        </text>
      `;
        }
    }

    return `
    ${sectionHeader(slide.title, 160, { primary: colors.primary, text: colors.text })}
    ${colBg}
    ${headers}
    ${vsBadge}
    ${items}
  `;
}
