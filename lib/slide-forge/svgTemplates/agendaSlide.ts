import { SlideData, ThemeConfig } from '../types';
import { escapeXml, sectionHeader, bulletMarker } from './utils';

export function generateAgendaSlide(slide: SlideData, theme: ThemeConfig): string {
    const { colors, complexity } = theme;
    const bullets = slide.bullets || [];

    let items = '';
    const startY = 220;
    const itemHeight = complexity === 'rich' ? 100 : 80;

    bullets.forEach((bullet, i) => {
        const y = startY + i * itemHeight;
        const number = String(i + 1).padStart(2, '0');

        if (complexity === 'rich') {
            // Rich: numbered cards with background
            items += `
        <rect x="160" y="${y - 10}" width="1600" height="${itemHeight - 15}" 
              rx="12" fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
        <text x="200" y="${y + 35}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="28" font-weight="700" fill="${colors.primary}">
          ${number}
        </text>
        <text x="280" y="${y + 35}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="26" font-weight="500" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        } else if (complexity === 'standard') {
            // Standard: numbered with accent line
            items += `
        <rect x="160" y="${y + 10}" width="50" height="50" rx="25" 
              fill="${colors.primary}" />
        <text x="185" y="${y + 43}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="22" font-weight="700" fill="${colors.background}"
              text-anchor="middle">
          ${number}
        </text>
        <text x="240" y="${y + 43}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="26" font-weight="400" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        } else {
            // Simple: bullet points
            items += `
        ${bulletMarker(160, y + 43, colors.primary)}
        <text x="190" y="${y + 43}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="26" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        }
    });

    return `
    ${sectionHeader(slide.title, 140, { primary: colors.primary, text: colors.text })}
    ${items}
  `;
}
