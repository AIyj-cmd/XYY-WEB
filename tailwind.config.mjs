/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#EFF4FF',
          100: '#DBE8FF',
          200: '#BFD4FF',
          500: '#3B6FCC',
          700: '#1B3A6B',
          800: '#132B50',
          900: '#0A1A33',
        },
        brand: {
          orange: '#E85D26',
          'orange-dark': '#C44D1B',
          blue: '#2563EB',
        },
      },
      fontFamily: {
        sans: [
          'Alibaba PuHuiTi', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A1A33 0%, #1B3A6B 50%, #132B50 100%)',
      },
    },
  },
  plugins: [],
}
