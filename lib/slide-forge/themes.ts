import { ThemeConfig, DesignComplexity } from './types';

export const THEMES: Record<string, ThemeConfig> = {
    'corporate-blue': {
        name: 'Corporate Blue',
        colors: {
            primary: '#1E40AF',
            secondary: '#3B82F6',
            accent: '#60A5FA',
            background: '#FFFFFF',
            surface: '#F0F4FF',
            text: '#1E293B',
            textMuted: '#64748B',
            border: '#CBD5E1',
        },
        fonts: { title: 'Noto Sans JP', body: 'Noto Sans JP' },
        complexity: 'standard',
    },
    'warm-gradient': {
        name: 'Warm Gradient',
        colors: {
            primary: '#DC2626',
            secondary: '#F59E0B',
            accent: '#FB923C',
            background: '#FFFBEB',
            surface: '#FEF3C7',
            text: '#1C1917',
            textMuted: '#78716C',
            border: '#D6D3D1',
        },
        fonts: { title: 'Noto Sans JP', body: 'Noto Sans JP' },
        complexity: 'standard',
    },
    'dark-mode': {
        name: 'Dark Mode',
        colors: {
            primary: '#818CF8',
            secondary: '#6366F1',
            accent: '#A78BFA',
            background: '#0F172A',
            surface: '#1E293B',
            text: '#F1F5F9',
            textMuted: '#94A3B8',
            border: '#334155',
        },
        fonts: { title: 'Noto Sans JP', body: 'Noto Sans JP' },
        complexity: 'standard',
    },
    'nature-green': {
        name: 'Nature Green',
        colors: {
            primary: '#065F46',
            secondary: '#10B981',
            accent: '#34D399',
            background: '#F0FDF4',
            surface: '#DCFCE7',
            text: '#14532D',
            textMuted: '#6B7280',
            border: '#BBF7D0',
        },
        fonts: { title: 'Noto Sans JP', body: 'Noto Sans JP' },
        complexity: 'standard',
    },
    'purple-dream': {
        name: 'Purple Dream',
        colors: {
            primary: '#7C3AED',
            secondary: '#A855F7',
            accent: '#C084FC',
            background: '#FAF5FF',
            surface: '#F3E8FF',
            text: '#1E1B4B',
            textMuted: '#6B7280',
            border: '#DDD6FE',
        },
        fonts: { title: 'Noto Sans JP', body: 'Noto Sans JP' },
        complexity: 'standard',
    },
};

export function getTheme(name: string, complexity: DesignComplexity): ThemeConfig {
    const base = THEMES[name] || THEMES['corporate-blue'];
    return { ...base, complexity };
}

export function getThemeNames(): { key: string; name: string }[] {
    return Object.entries(THEMES).map(([key, theme]) => ({
        key,
        name: theme.name,
    }));
}
