import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        orange: { DEFAULT: '#F97316', light: '#FB923C', dim: 'rgba(249,115,22,0.11)' },
        teal: { DEFAULT: '#34D399', dim: 'rgba(52,211,153,0.10)' },
        gold: { DEFAULT: '#FBBF24', dim: 'rgba(251,191,36,0.10)' },
        bg: { DEFAULT: '#09090F' },
        s1: { DEFAULT: '#111118' },
        s2: { DEFAULT: '#18181F' },
        s3: { DEFAULT: '#1E1E2C' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
