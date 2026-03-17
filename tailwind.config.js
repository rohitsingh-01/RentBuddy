/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        forest: {
          50:  '#f0f7f4',
          100: '#d9ede5',
          200: '#b4dbcc',
          300: '#82c0a8',
          400: '#4fa082',
          500: '#2d8265',
          600: '#1e6850',
          700: '#185441',
          800: '#144336',
          900: '#11382d',
          950: '#081f19',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#faf7ef',
          200: '#f4edda',
          300: '#ebdfc0',
          400: '#dfcb9e',
          500: '#d0b478',
          600: '#be9a58',
          700: '#a07f46',
          800: '#83673c',
          900: '#6b5534',
        },
        coral: {
          400: '#f07057',
          500: '#e85438',
          600: '#d43e23',
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
