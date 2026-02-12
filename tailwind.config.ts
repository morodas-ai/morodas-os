
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F5EDE3",
                foreground: "#3E2C23",
                primary: {
                    50: "#FDF5EF",
                    100: "#F5DCC8",
                    200: "#E8C4A0",
                    300: "#D4956B",
                    400: "#C96D4A",
                    500: "#B85C38",
                    600: "#9A4A2D",
                    700: "#8B3E22",
                    800: "#6E2F1A",
                    900: "#4A1F10",
                    DEFAULT: "#B85C38",
                },
                surface: {
                    50: "#FDFAF6",
                    100: "#F0E6D8",
                    200: "#D6C9BA",
                    300: "#C4B5A3",
                },
                accent: {
                    DEFAULT: "#5B8A72",
                    light: "#7BA892",
                    dark: "#3D6B4F",
                },
                sidebar: {
                    DEFAULT: "#3E2C23",
                    hover: "#553D30",
                },
                muted: "#8D7B6E",
            },
            fontFamily: {
                sans: ['Noto Sans JP', 'var(--font-inter)', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "primary-gradient": "linear-gradient(135deg, #B85C38, #D4956B)",
                "warm-gradient": "linear-gradient(135deg, #B85C38, #C96D4A)",
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #B85C38' },
                    '100%': { boxShadow: '0 0 20px #B85C38, 0 0 10px #D4956B' },
                }
            }
        },
    },
    plugins: [],
};
export default config;

