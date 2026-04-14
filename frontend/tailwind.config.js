/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta premium Norma Brasil
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#2D6A4F', // Verde escuro premium
          600: '#1B4332', // Verde mais escuro
          700: '#143626',
          800: '#0D261A',
          900: '#06140E',
        },
        accent: {
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE699',
          300: '#FFD966',
          400: '#D4AF37', // Dourado metálico
          500: '#C9A84C', // Dourado principal
          600: '#B8943F',
          700: '#9E7F33',
          800: '#856A2B',
          900: '#6B5522',
        },
        dark: {
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#BDBDBD',
          300: '#9E9E9E',
          400: '#757575',
          500: '#424242',
          600: '#1A1A1A', // Fundo escuro principal
          700: '#141414',
          800: '#0F0F0F',
          900: '#0A0A0A', // Preto quase total
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'premium-lg': '0 8px 40px rgba(0, 0, 0, 0.4)',
        'gold': '0 4px 20px rgba(201, 168, 76, 0.2)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0A0A0A 0%, #1B4332 50%, #0A0A0A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #C9A84C 50%, #B8943F 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
