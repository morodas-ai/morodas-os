import { SlideData, ThemeConfig } from './types';
import { generateTitleSlide } from './svgTemplates/titleSlide';
import { generateAgendaSlide } from './svgTemplates/agendaSlide';
import { generateContentSlide } from './svgTemplates/contentSlide';
import { generateTwoColumnSlide } from './svgTemplates/twoColumnSlide';
import { generateComparisonSlide } from './svgTemplates/comparisonSlide';
import { generateChartSlide } from './svgTemplates/chartSlide';
import { generateImageTextSlide } from './svgTemplates/imageTextSlide';
import { generateSummarySlide } from './svgTemplates/summarySlide';

const SVG_WIDTH = 1920;
const SVG_HEIGHT = 1080;

/**
 * Generate SVG string for a given slide
 */
export function generateSlideSVG(slide: SlideData, theme: ThemeConfig, totalSlides: number): string {
    let content: string;

    switch (slide.type) {
        case 'title':
            content = generateTitleSlide(slide, theme);
            break;
        case 'agenda':
            content = generateAgendaSlide(slide, theme);
            break;
        case 'content':
            content = generateContentSlide(slide, theme);
            break;
        case 'two-column':
            content = generateTwoColumnSlide(slide, theme);
            break;
        case 'comparison':
            content = generateComparisonSlide(slide, theme);
            break;
        case 'chart':
            content = generateChartSlide(slide, theme);
            break;
        case 'image-text':
            content = generateImageTextSlide(slide, theme);
            break;
        case 'summary':
            content = generateSummarySlide(slide, theme);
            break;
        default:
            content = generateContentSlide(slide, theme);
    }

    return wrapSVG(content, theme, slide.index, totalSlides);
}

/**
 * Generate all slides as SVG strings
 */
export function generateAllSlidesSVG(slides: SlideData[], theme: ThemeConfig): string[] {
    return slides.map((slide) => generateSlideSVG(slide, theme, slides.length));
}

/**
 * Wrap content in SVG container with background and footer
 */
function wrapSVG(
    content: string,
    theme: ThemeConfig,
    slideIndex: number,
    totalSlides: number
): string {
    const { colors, complexity } = theme;

    // Background
    let background: string;
    if (complexity === 'rich') {
        background = `
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.surface};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="url(#bgGrad)" />
      <!-- Decorative circles -->
      <circle cx="${SVG_WIDTH - 100}" cy="100" r="300" fill="${colors.primary}" opacity="0.04" />
      <circle cx="100" cy="${SVG_HEIGHT - 100}" r="200" fill="${colors.secondary}" opacity="0.06" />
      <circle cx="${SVG_WIDTH / 2}" cy="${SVG_HEIGHT / 2}" r="400" fill="${colors.accent}" opacity="0.02" />
    `;
    } else if (complexity === 'standard') {
        background = `
      <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${colors.background}" />
      <rect x="0" y="0" width="8" height="${SVG_HEIGHT}" fill="${colors.primary}" />
      <rect x="0" y="${SVG_HEIGHT - 4}" width="${SVG_WIDTH}" height="4" fill="${colors.primary}" opacity="0.3" />
    `;
    } else {
        background = `<rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${colors.background}" />`;
    }

    // Footer with page number
    const footer = `
    <text x="${SVG_WIDTH - 60}" y="${SVG_HEIGHT - 30}" 
          font-family="'Noto Sans JP', sans-serif" font-size="20" 
          fill="${colors.textMuted}" text-anchor="end">
      ${slideIndex + 1} / ${totalSlides}
    </text>
  `;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="${SVG_WIDTH}" height="${SVG_HEIGHT}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&amp;display=swap');
    text { font-family: 'Noto Sans JP', sans-serif; }
  </style>
  ${background}
  ${content}
  ${footer}
</svg>`;
}
