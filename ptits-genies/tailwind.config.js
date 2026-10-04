import { couleurs } from './src/theme/couleurs.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ...couleurs,
      },
      fontFamily: {
        texte: ['Lexend', 'sans-serif'],
        titre: ['"Archivo Black"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'dur-sm': `2px 2px 0 0 ${couleurs.encre}`,
        dur: `4px 4px 0 0 ${couleurs.encre}`,
        'dur-lg': `6px 6px 0 0 ${couleurs.encre}`,
      },
      keyframes: {
        secousse: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '80%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(200%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        secousse: 'secousse 0.4s ease-in-out',
        float: 'float 4s ease-in-out infinite',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        wiggle: 'wiggle 0.5s ease-in-out 2',
        shimmer: 'shimmer 1.5s infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
