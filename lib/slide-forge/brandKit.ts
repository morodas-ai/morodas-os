// ========================================
// SlideForge — Brand Kit Manager
// ========================================

export interface BrandKit {
    id: string;
    name: string;
    logoDataUrl?: string;  // base64 data URL
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    fontFamily: string;
    createdAt: number;
}

const STORAGE_KEY = 'slideforge-brandkits';

export function loadBrandKits(): BrandKit[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function saveBrandKit(kit: BrandKit): BrandKit[] {
    const kits = loadBrandKits();
    const existing = kits.findIndex(k => k.id === kit.id);
    if (existing >= 0) {
        kits[existing] = kit;
    } else {
        kits.push(kit);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kits));
    return kits;
}

export function deleteBrandKit(id: string): BrandKit[] {
    const kits = loadBrandKits().filter(k => k.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kits));
    return kits;
}

export function brandKitToThemeColors(kit: BrandKit) {
    return {
        primary: kit.colors.primary,
        secondary: kit.colors.secondary,
        accent: kit.colors.accent,
        background: kit.colors.background,
        surface: adjustBrightness(kit.colors.background, -5),
        text: kit.colors.text,
        textMuted: adjustBrightness(kit.colors.text, 40),
        border: adjustBrightness(kit.colors.background, -15),
    };
}

// Utility: adjust hex color brightness
function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent)));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + Math.round(2.55 * percent)));
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const DEFAULT_BRAND_KIT: Omit<BrandKit, 'id' | 'createdAt'> = {
    name: '',
    colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#60A5FA',
        background: '#FFFFFF',
        text: '#1E293B',
    },
    fontFamily: 'Noto Sans JP',
};
