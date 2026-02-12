import { SlideData, ThemeConfig } from '../types';
import { escapeXml, sectionHeader } from './utils';

export function generateTwoColumnSlide(slide: SlideData, theme: ThemeConfig): string {
    const { colors, complexity } = theme;
    const columns = slide.columns || [];
    const leftCol = columns[0] || { header: '', items: [] };
    const rightCol = columns[1] || { header: '', items: [] };

    const colWidth = 750;
    const leftX = 140;
    const rightX = 1020;
    const headerY = 260;
    const itemStartY = 330;
    const lineHeight = 55;

    let leftContent = '';
    let rightContent = '';

    // Column headers
    if (complexity === 'rich') {
        leftContent += `
      <rect x="${leftX}" y="${headerY - 35}" width="${colWidth}" height="50" rx="8" fill="${colors.primary}" />
      <text x="${leftX + colWidth / 2}" y="${headerY}" font-family="'Noto Sans JP', sans-serif" 
            font-size="24" font-weight="700" fill="${colors.background}" text-anchor="middle">
        ${escapeXml(leftCol.header)}
      </text>
    `;
        rightContent += `
      <rect x="${rightX}" y="${headerY - 35}" width="${colWidth}" height="50" rx="8" fill="${colors.secondary}" />
      <text x="${rightX + colWidth / 2}" y="${headerY}" font-family="'Noto Sans JP', sans-serif" 
            font-size="24" font-weight="700" fill="${colors.background}" text-anchor="middle">
        ${escapeXml(rightCol.header)}
      </text>
    `;
    } else {
        leftContent += `
      <text x="${leftX}" y="${headerY}" font-family="'Noto Sans JP', sans-serif" 
            font-size="28" font-weight="700" fill="${colors.primary}">
        ${escapeXml(leftCol.header)}
      </text>
      <rect x="${leftX}" y="${headerY + 10}" width="${colWidth}" height="2" fill="${colors.primary}" opacity="0.3" />
    `;
        rightContent += `
      <text x="${rightX}" y="${headerY}" font-family="'Noto Sans JP', sans-serif" 
            font-size="28" font-weight="700" fill="${colors.secondary}">
        ${escapeXml(rightCol.header)}
      </text>
      <rect x="${rightX}" y="${headerY + 10}" width="${colWidth}" height="2" fill="${colors.secondary}" opacity="0.3" />
    `;
    }

    // Column items
    leftCol.items.forEach((item, i) => {
        const y = itemStartY + i * lineHeight;
        leftContent += `
      <circle cx="${leftX + 12}" cy="${y}" r="4" fill="${colors.primary}" />
      <text x="${leftX + 30}" y="${y + 5}" font-family="'Noto Sans JP', sans-serif" 
            font-size="22" fill="${colors.text}">
        ${escapeXml(item)}
      </text>
    `;
    });

    rightCol.items.forEach((item, i) => {
        const y = itemStartY + i * lineHeight;
        rightContent += `
      <circle cx="${rightX + 12}" cy="${y}" r="4" fill="${colors.secondary}" />
      <text x="${rightX + 30}" y="${y + 5}" font-family="'Noto Sans JP', sans-serif" 
            font-size="22" fill="${colors.text}">
        ${escapeXml(item)}
      </text>
    `;
    });

    // Divider line
    const divider = `<rect x="970" y="230" width="2" height="700" fill="${colors.border}" rx="1" />`;

    return `
    ${sectionHeader(slide.title, 160, { primary: colors.primary, text: colors.text })}
    ${divider}
    ${leftContent}
    ${rightContent}
  `;
}
