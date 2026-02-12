/**
 * Escape special XML characters to prevent SVG rendering issues
 */
export function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Wrap text into multiple lines based on max character count
 */
export function wrapText(text: string, maxChars: number): string[] {
    if (text.length <= maxChars) return [text];

    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + ' ' + word).trim().length > maxChars) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine = (currentLine + ' ' + word).trim();
        }
    }
    if (currentLine) lines.push(currentLine.trim());

    // If no spaces found, break by character count (for Japanese text)
    if (lines.length === 0 || (lines.length === 1 && lines[0].length > maxChars)) {
        const charLines: string[] = [];
        for (let i = 0; i < text.length; i += maxChars) {
            charLines.push(text.slice(i, i + maxChars));
        }
        return charLines;
    }

    return lines;
}

/**
 * Generate a bullet marker SVG element
 */
export function bulletMarker(
    x: number,
    y: number,
    color: string,
    style: 'circle' | 'square' | 'dash' = 'circle'
): string {
    switch (style) {
        case 'square':
            return `<rect x="${x}" y="${y - 8}" width="10" height="10" rx="2" fill="${color}" />`;
        case 'dash':
            return `<rect x="${x}" y="${y - 4}" width="16" height="3" rx="1.5" fill="${color}" />`;
        case 'circle':
        default:
            return `<circle cx="${x + 5}" cy="${y - 3}" r="5" fill="${color}" />`;
    }
}

/**
 * Generate section header with colored accent
 */
export function sectionHeader(
    title: string,
    y: number,
    theme: { primary: string; text: string }
): string {
    return `
    <rect x="100" y="${y - 40}" width="6" height="50" rx="3" fill="${theme.primary}" />
    <text x="130" y="${y}" 
          font-family="'Noto Sans JP', sans-serif" 
          font-size="44" font-weight="700" 
          fill="${theme.text}">
      ${escapeXml(title)}
    </text>
  `;
}
