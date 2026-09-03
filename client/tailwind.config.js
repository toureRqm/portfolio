/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette claire facon Nexorius : creme, brun profond, terre cuite.
        // Les noms de jetons sont inchanges pour que tout le front bascule
        // sans toucher aux composants. "gold" porte desormais la terre cuite.
        bg: {
          primary: '#f6efe7',
          secondary: '#efe6db',
          card: '#fbf6f0',
        },
        text: {
          primary: '#241d1a',
          secondary: '#6b5e56',
        },
        gold: {
          DEFAULT: '#a8552e',
          light: '#c4703f',
          dim: 'rgba(168,85,46,0.10)',
        },
        accent: {
          blue: '#1f5a99',
        },
        border: {
          DEFAULT: '#e3d8cb',
          hover: '#a8552e',
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
