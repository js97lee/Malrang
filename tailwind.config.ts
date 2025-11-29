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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 그레이 브랜드 컬러
        primary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        surface: {
          DEFAULT: '#ffffff',
          variant: '#f5f5f5',
        },
      },
      boxShadow: {
        'elevation-1': 'none',
        'elevation-2': 'none',
        'elevation-3': 'none',
        'elevation-4': 'none',
        'elevation-5': 'none',
      },
      borderRadius: {
        'material': '28px',
        'material-sm': '16px',
        'material-md': '20px',
        'material-lg': '24px',
      },
    },
  },
  plugins: [],
};
export default config;

