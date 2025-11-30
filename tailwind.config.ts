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
        // Brown 브랜드 컬러
        primary: {
          50: '#F5F1EB',
          100: '#E8DDD1',
          200: '#D4C4B0',
          300: '#B8A085',
          400: '#8B6F47',
          500: '#562915', // Brown - 메인 컬러
          600: '#452110',
          700: '#341A0C',
          800: '#231208',
          900: '#120904',
        },
        // Orange 서브 컬러
        secondary: {
          50: '#FFF5F0',
          100: '#FFE6D6',
          200: '#FFCCAD',
          300: '#FFB380',
          400: '#FF9952',
          500: '#FF7300', // Orange - 서브 컬러
          600: '#CC5C00',
          700: '#994500',
          800: '#662E00',
          900: '#331700',
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

