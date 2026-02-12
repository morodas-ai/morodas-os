import { SlideData, ThemeConfig } from '../types';
import { escapeXml, sectionHeader, bulletMarker } from './utils';

export function generateImageTextSlide(slide: SlideData, theme: ThemeConfig): string {
  const { colors, complexity } = theme;
  const bullets = slide.bullets || [];
  const keyNumber = slide.keyNumber || '';
  const keyNumberLabel = slide.keyNumberLabel || '';
  const imageDataUrl = slide.imageDataUrl || '';

  const leftAreaX = 140;
  const leftAreaWidth = 680;
  const textAreaX = 900;

  // Left side: image OR key number
  let leftSection = '';

  if (imageDataUrl) {
    // Embedded image with rounded container
    const imgX = leftAreaX;
    const imgY = 260;
    const imgW = leftAreaWidth;
    const imgH = 560;

    if (complexity === 'rich') {
      leftSection = `
        <defs>
          <clipPath id="imgClip-${slide.index}">
            <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="20" />
          </clipPath>
        </defs>
        <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="20"
              fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
        <image href="${imageDataUrl}" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}"
               preserveAspectRatio="xMidYMid meet"
               clip-path="url(#imgClip-${slide.index})" />
      `;
    } else {
      leftSection = `
        <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="12"
              fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
        <image href="${imageDataUrl}" x="${imgX + 10}" y="${imgY + 10}" 
               width="${imgW - 20}" height="${imgH - 20}"
               preserveAspectRatio="xMidYMid meet" />
      `;
    }
  } else if (keyNumber) {
    // Fall back to key number display
    const keyNumCenterY = 500;
    if (complexity === 'rich') {
      leftSection = `
        <rect x="${leftAreaX}" y="260" width="${leftAreaWidth}" height="560" rx="20" 
              fill="${colors.surface}" stroke="${colors.border}" stroke-width="1" />
        <text x="${leftAreaX + leftAreaWidth / 2}" y="${keyNumCenterY - 20}" 
              font-family="'Noto Sans JP', sans-serif"
              font-size="96" font-weight="900" fill="${colors.primary}" text-anchor="middle">
          ${escapeXml(keyNumber)}
        </text>
        <text x="${leftAreaX + leftAreaWidth / 2}" y="${keyNumCenterY + 50}" 
              font-family="'Noto Sans JP', sans-serif"
              font-size="24" font-weight="400" fill="${colors.textMuted}" text-anchor="middle">
          ${escapeXml(keyNumberLabel)}
        </text>
      `;
    } else {
      leftSection = `
        <text x="${leftAreaX + leftAreaWidth / 2}" y="${keyNumCenterY - 20}" 
              font-family="'Noto Sans JP', sans-serif"
              font-size="88" font-weight="900" fill="${colors.primary}" text-anchor="middle">
          ${escapeXml(keyNumber)}
        </text>
        <text x="${leftAreaX + leftAreaWidth / 2}" y="${keyNumCenterY + 40}" 
              font-family="'Noto Sans JP', sans-serif"
              font-size="22" fill="${colors.textMuted}" text-anchor="middle">
          ${escapeXml(keyNumberLabel)}
        </text>
      `;
    }
  }

  // Bullet list on the right
  let bulletSection = '';
  const bulletStartY = 320;
  const lineHeight = 65;

  bullets.forEach((bullet, i) => {
    const y = bulletStartY + i * lineHeight;
    bulletSection += `
      ${bulletMarker(textAreaX, y + 5, colors.secondary)}
      <text x="${textAreaX + 25}" y="${y + 5}" font-family="'Noto Sans JP', sans-serif"
            font-size="22" fill="${colors.text}">
        ${escapeXml(bullet)}
      </text>
    `;
  });

  return `
    ${sectionHeader(slide.title, 160, { primary: colors.primary, text: colors.text })}
    ${leftSection}
    ${bulletSection}
  `;
}
