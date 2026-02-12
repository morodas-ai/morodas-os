import { SlideData, ThemeConfig } from '../types';
import { escapeXml } from './utils';

export function generateTitleSlide(slide: SlideData, theme: ThemeConfig): string {
    const { colors, complexity } = theme;

    let decoration = '';
    if (complexity === 'rich') {
        decoration = `
      <!-- Decorative accent bar -->
      <rect x="760" y="420" width="400" height="6" rx="3" fill="${colors.primary}" />
      <!-- Corner decorations -->
      <rect x="60" y="60" width="80" height="4" fill="${colors.primary}" opacity="0.5" />
      <rect x="60" y="60" width="4" height="80" fill="${colors.primary}" opacity="0.5" />
      <rect x="${1920 - 140}" y="${1080 - 64}" width="80" height="4" fill="${colors.primary}" opacity="0.5" />
      <rect x="${1920 - 64}" y="${1080 - 140}" width="4" height="80" fill="${colors.primary}" opacity="0.5" />
    `;
    } else if (complexity === 'standard') {
        decoration = `
      <rect x="860" y="430" width="200" height="4" rx="2" fill="${colors.primary}" />
    `;
    }

    const titleFontSize = (slide.title?.length || 0) > 20 ? 64 : 80;

    return `
    ${decoration}
    <text x="960" y="380" 
          font-family="'Noto Sans JP', sans-serif" 
          font-size="${titleFontSize}" font-weight="900" 
          fill="${colors.text}" text-anchor="middle"
          letter-spacing="2">
      ${escapeXml(slide.title || '')}
    </text>
    ${slide.subtitle ? `
    <text x="960" y="500" 
          font-family="'Noto Sans JP', sans-serif" 
          font-size="32" font-weight="400" 
          fill="${colors.textMuted}" text-anchor="middle">
      ${escapeXml(slide.subtitle)}
    </text>
    ` : ''}
  `;
}
