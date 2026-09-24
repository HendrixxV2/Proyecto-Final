/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ---------- Paleta Okabe-Ito (colorblind-safe) ---------- */
        negro: { DEFAULT: '#000000', soft: '#1C1917' },
        blanco: { DEFAULT: '#FFFFFF', soft: '#F7F6F4' },

        bermellon: {
          50:  '#FDF1EB', 100: '#FADECF', 200: '#F4BC9F', 300: '#EE9A6F',
          400: '#E57C41', 500: '#D55E00', 600: '#B04E00', 700: '#8A3D00',
          800: '#632C00', 900: '#3D1B00',
        },
        naranja: {
          50:  '#FDF6E6', 100: '#FBEBC4', 200: '#F5D688', 300: '#EFC04C',
          400: '#E9A81C', 500: '#E69F00', 600: '#B87D00', 700: '#8A5E00',
          800: '#5C3F00', 900: '#2E1F00',
        },
        amarillo: {
          50:  '#FEFCE9', 100: '#FDF9C4', 200: '#FAF488', 300: '#F7EE4C',
          400: '#F4E824', 500: '#F0E442', 600: '#D9CD14', 700: '#A69C0F',
          800: '#726B0A', 900: '#3F3A05',
        },
        cian: {
          50:  '#E6F7F1', 100: '#C2EBD9', 200: '#85D7B3', 300: '#48C38D',
          400: '#1DAF77', 500: '#009E73', 600: '#007D5C', 700: '#005C44',
          800: '#003C2D', 900: '#001C15',
        },
        cielo: {
          50:  '#EEF8FD', 100: '#CDEAF8', 200: '#9BD5F1', 300: '#69C0EA',
          400: '#56B4E9', 500: '#3C9DD3', 600: '#2D7BA6', 700: '#1F597A',
          800: '#12384D', 900: '#081C26',
        },
        azul: {
          50:  '#E6F2F8', 100: '#C2DFEE', 200: '#85BFDD', 300: '#489FCC',
          400: '#1D86BE', 500: '#0072B2', 600: '#005B8E', 700: '#00446B',
          800: '#002E47', 900: '#001724',
        },
        magenta: {
          50:  '#FAEEF4', 100: '#F3D5E3', 200: '#E7ABC7', 300: '#DB81AB',
          400: '#D07D9B', 500: '#CC79A7', 600: '#A45E84', 700: '#7B4663',
          800: '#522F42', 900: '#291821',
        },

        /* ---------- Escala neutra (negro/blanco) ---------- */
        ink: {
          50:  '#F7F6F4', 100: '#EDEAE6', 200: '#D8D3CC', 300: '#B8B0A6',
          400: '#8E857A', 500: '#6B6259', 600: '#524A43', 700: '#3B352F',
          800: '#26221E', 900: '#1C1917',
        },

        /* ---------- Alias semánticos (compatibilidad) ---------- */
        brand:  { 50:'#FDF1EB',100:'#FADECF',200:'#F4BC9F',300:'#EE9A6F',400:'#E57C41',500:'#D55E00',600:'#B04E00',700:'#8A3D00',800:'#632C00',900:'#3D1B00' }, // = bermellon
        jade:   { 50:'#E6F7F1',100:'#C2EBD9',200:'#85D7B3',300:'#48C38D',400:'#1DAF77',500:'#009E73',600:'#007D5C',700:'#005C44',800:'#003C2D',900:'#001C15' }, // = cian
        gold:   { 400:'#E9A81C',500:'#E69F00',600:'#B87D00' }, // = naranja
      },

      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },

      spacing: { 4.5: '1.125rem', 13: '3.25rem', 18: '4.5rem' },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(0 0 0 / 0.10), 0 4px 16px -4px rgb(0 0 0 / 0.08)',
        ring: '0 0 0 3px rgb(0 114 178 / 0.35)', // azul Okabe para focus
      },
      keyframes: {
        'fade-in':  { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in':  'fade-in .2s ease-out',
        'slide-up': 'slide-up .25s ease-out',
      },
    },
  },
  plugins: [],
};