/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C6FF7',
        secondary: '#FF7B54',
        accent: '#FFD166',
        bg: '#F8F7FF',
        success: '#06D6A0',
        error: '#EF476F',
        ink: '#2D2D3A',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        fredoka: ['Fredoka', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(45, 45, 58, 0.08)',
        'card-hover': '0 8px 40px rgba(45, 45, 58, 0.16)',
        'glow': '0 4px 24px rgba(124, 111, 247, 0.40)',
        'glow-sm': '0 2px 12px rgba(124, 111, 247, 0.30)',
        'glow-orange': '0 4px 24px rgba(255, 123, 84, 0.40)',
        'glow-success': '0 4px 24px rgba(6, 214, 160, 0.40)',
      },
      keyframes: {
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
