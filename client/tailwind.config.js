/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#111118',
          card: '#16161d',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#a0a0a0',
        },
        gold: {
          DEFAULT: '#c9a96e',
          light: '#e2c99a',
          dim: 'rgba(201,169,110,0.18)',
        },
        accent: {
          blue: '#2b6cb0',
        },
        border: {
          DEFAULT: '#2a2a35',
          hover: '#c9a96e',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'floatY 6s ease-in-out infinite',
        'float-slow': 'floatY 9s ease-in-out infinite',
        'spin-slow': 'spin 50s linear infinite',
        'spin-slow-reverse': 'spin 30s linear infinite reverse',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
      },
      keyframes: {
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
