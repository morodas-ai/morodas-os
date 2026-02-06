
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#050505", // 深い黒
                foreground: "#ededed",
                primary: {
                    50: "#ecfdf5",
                    100: "#d1fae5",
                    200: "#a7f3d0",
                    300: "#6ee7b7",
                    400: "#34d399",
                    500: "#10b981", // Emerald 500
                    600: "#059669",
                    700: "#047857",
                    800: "#065f46",
                    900: "#064e3b",
                    DEFAULT: "#10b981",
                },
                surface: {
                    50: "#121212",
                    100: "#18181b",
                    200: "#27272a",
                    300: "#3f3f46",
                    glass: "rgba(24, 24, 27, 0.4)", // グラスモーフィズム用
                },
                accent: {
                    from: "#10b981", // Emerald
                    to: "#3b82f6",   // Blue
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "glass-gradient": "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
                "primary-gradient": "linear-gradient(to right, #10b981, #3b82f6)",
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #10b981' },
                    '100%': { boxShadow: '0 0 20px #10b981, 0 0 10px #34d399' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
