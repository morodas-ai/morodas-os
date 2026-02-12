import { SlideData, ThemeConfig } from '../types';
import { escapeXml, bulletMarker } from './utils';

export function generateSummarySlide(slide: SlideData, theme: ThemeConfig): string {
    const { colors, complexity } = theme;
    const bullets = slide.bullets || [];

    const titleY = 350;
    const bulletStartY = 460;
    const lineHeight = 65;

    let decoration = '';
    if (complexity === 'rich') {
        decoration = `
      <rect x="660" y="${titleY + 20}" width="600" height="5" rx="2.5" fill="${colors.primary}" />
      <!-- Top accent -->
      <rect x="0" y="0" width="1920" height="8" fill="${colors.primary}" />
    `;
    } else if (complexity === 'standard') {
        decoration = `
      <rect x="810" y="${titleY + 20}" width="300" height="3" rx="1.5" fill="${colors.primary}" />
    `;
    }

    // Title centered
    const title = `
    <text x="960" y="${titleY}" font-family="'Noto Sans JP', sans-serif"
          font-size="52" font-weight="700" fill="${colors.text}" text-anchor="middle">
      ${escapeXml(slide.title)}
    </text>
  `;

    // Bullets centered
    let items = '';
    bullets.forEach((bullet, i) => {
        const y = bulletStartY + i * lineHeight;

        if (complexity === 'rich') {
            items += `
        <rect x="300" y="${y - 18}" width="1320" height="${lineHeight - 10}" rx="10" 
              fill="${colors.surface}" />
        <rect x="300" y="${y - 18}" width="5" height="${lineHeight - 10}" rx="2.5" 
              fill="${colors.primary}" />
        <text x="330" y="${y + 18}" font-family="'Noto Sans JP', sans-serif"
              font-size="24" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        } else {
            items += `
        ${bulletMarker(400, y + 18, colors.primary, 'square')}
        <text x="430" y="${y + 18}" font-family="'Noto Sans JP', sans-serif"
              font-size="24" fill="${colors.text}">
          ${escapeXml(bullet)}
        </text>
      `;
        }
    });

    return `
    ${decoration}
    ${title}
    ${items}
  `;
}
