/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0effe',
          100: '#e0ddfb',
          200: '#c4bef8',
          300: '#a89af3',
          400: '#8b76ee',
          500: '#7c6dfa',
          600: '#6355e8',
          700: '#5040c0',
          800: '#3d3099',
          900: '#2a2070',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f7',
          200: '#e8e8f0',
          300: '#d4d4e0',
          400: '#bfbfd4',   // ✅ added
          500: '#9a9ab0',   // ✅ added
          600: '#6b6b80',   // ✅ added (THIS FIXES YOUR ERROR)
          700: '#26262e',
          800: '#1e1e24',
          850: '#18181f',
          900: '#13131a',
          950: '#0d0d14',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'pulse-dot': 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'none' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'none' } },
        pulseDot: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.4' } }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 109, 250, 0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'modal': '0 20px 60px rgba(0,0,0,0.5)',
      }
    }
  },
  plugins: [],
}