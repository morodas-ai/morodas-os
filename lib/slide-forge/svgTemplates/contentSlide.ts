import { SlideData, ThemeConfig } from '../types';
import { escapeXml, sectionHeader, bulletMarker } from './utils';

export function generateContentSlide(slide: SlideData, theme: ThemeConfig): string {
    const { colors, complexity } = theme;
    const bullets = slide.bullets || [];

    const startY = 260;
    const lineHeight = complexity === 'rich' ? 95 : 80;

    let items = '';
    bullets.forEach((bullet, i) => {
        const y = startY + i * lineHeight;

        if (complexity === 'rich') {
            // Rich: card-style bullets
            items += `
        <rect x="140" y="${y - 20}" width="1640" height="${lineHeight - 12}" 
              rx="10" fill="${colors.surface}" />
        <rect x="140" y="${y - 20}" width="6" height="${lineHeight - 12}" 
              rx="3" fill="${colors.primary}" />
        <text x="180" y="${y + 25}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="26" font-weight="400" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        } else if (complexity === 'standard') {
            // Standard: colored bullets
            items += `
        ${bulletMarker(140, y + 25, colors.primary)}
        <text x="175" y="${y + 25}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="26" font-weight="400" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        } else {
            // Simple: minimal
            items += `
        ${bulletMarker(140, y + 25, colors.textMuted, 'dash')}
        <text x="175" y="${y + 25}" 
              font-family="'Noto Sans JP', sans-serif" 
              font-size="26" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        }
    });

    return `
    ${sectionHeader(slide.title, 160, { primary: colors.primary, text: colors.text })}
    ${items}
  `;
}
