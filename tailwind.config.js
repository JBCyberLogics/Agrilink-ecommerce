/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: Nature Green
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#43A047',
          soft: '#E8F5E9',
        },
        // Brand: Warm Amber
        secondary: {
          DEFAULT: '#FFA000',
          dark: '#C77800',
          soft: '#FFF8E1',
        },
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 16px -4px rgb(15 40 20 / 0.08)',
        lift: '0 16px 40px -12px rgb(46 125 50 / 0.28)',
        glass: '0 8px 32px 0 rgb(31 38 135 / 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.4)', opacity: '0' },
          '70%': { transform: 'scale(1.35)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        pop: 'pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.4) both',
        float: 'float 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
