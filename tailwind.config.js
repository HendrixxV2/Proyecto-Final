/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF6EF', 100: '#FAE8D6', 200: '#F3CFAC', 300: '#E9AF78',
          400: '#DF8C48', 500: '#B4531F', 600: '#9A4419', 700: '#7B3513',
          800: '#5C270E', 900: '#3D1A09',
        },
        jade: {
          50: '#EFF7F6', 100: '#D6EBE8', 200: '#AED7D2', 300: '#7FBFB8',
          400: '#4E9E95', 500: '#1F6F6B', 600: '#185955', 700: '#134441',
          800: '#0D2F2D', 900: '#081D1C',
        },
        gold: { 400: '#F2BE6A', 500: '#E9A03B', 600: '#C9821F' },
        ink: {
          50: '#F7F6F4', 100: '#EDEAE6', 200: '#D8D3CC', 300: '#B8B0A6',
          400: '#8E857A', 500: '#6B6259', 600: '#524A43', 700: '#3B352F',
          800: '#26221E', 900: '#1C1917',
        },
      },
      fontFamily: {
        brand: ['"Caladea"', 'Georgia', 'serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      spacing: { 4.5: '1.125rem', 13: '3.25rem', 18: '4.5rem' },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(28 25 23 / 0.10), 0 4px 16px -4px rgb(28 25 23 / 0.08)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in .2s ease-out',
        'slide-up': 'slide-up .25s ease-out',
      },
    },
  },
  plugins: [],
};