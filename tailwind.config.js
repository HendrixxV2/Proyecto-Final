/** @type {import('tailwindcss').Config} */
const colorScale = (family, defaults) => Object.fromEntries(
  Object.entries(defaults).map(([shade, rgb]) => [
    shade,
    `rgb(var(--a11y-${family}-${shade}, ${rgb}) / <alpha-value>)`,
  ]),
);

const brandScale = colorScale('brand', {
  50: '253 241 235', 100: '250 222 207', 200: '244 188 159', 300: '238 154 111', 400: '229 124 65',
  500: '213 94 0', 600: '176 78 0', 700: '138 61 0', 800: '99 44 0', 900: '61 27 0',
});
const jadeScale = colorScale('jade', {
  50: '230 247 241', 100: '194 235 217', 200: '133 215 179', 300: '72 195 141', 400: '29 175 119',
  500: '0 158 115', 600: '0 125 92', 700: '0 92 68', 800: '0 60 45', 900: '0 28 21',
});
const goldScale = colorScale('gold', {
  50: '253 246 230', 100: '251 235 196', 200: '245 214 136', 300: '239 192 76', 400: '233 168 28',
  500: '230 159 0', 600: '184 125 0', 700: '138 94 0', 800: '92 63 0', 900: '46 31 0',
});
const cieloScale = colorScale('cielo', {
  50: '238 248 253', 100: '205 234 248', 200: '155 213 241', 300: '105 192 234', 400: '86 180 233',
  500: '60 157 211', 600: '45 123 166', 700: '31 89 122', 800: '18 56 77', 900: '8 28 38',
});
const azulScale = colorScale('cielo', {
  50: '230 242 248', 100: '194 223 238', 200: '133 191 221', 300: '72 159 204', 400: '29 134 190',
  500: '0 114 178', 600: '0 91 142', 700: '0 68 107', 800: '0 46 71', 900: '0 23 36',
});

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /* ---------- Paleta Okabe-Ito (colorblind-safe) ---------- */
        negro: { DEFAULT: '#000000', soft: '#1C1917' },
        blanco: { DEFAULT: '#FFFFFF', soft: '#F7F6F4' },

        bermellon: brandScale,
        naranja: {
          ...goldScale,
        },
        amarillo: {
          50:  '#FEFCE9', 100: '#FDF9C4', 200: '#FAF488', 300: '#F7EE4C',
          400: '#F4E824', 500: '#F0E442', 600: '#D9CD14', 700: '#A69C0F',
          800: '#726B0A', 900: '#3F3A05',
        },
        cian: jadeScale,
        cielo: cieloScale,
        azul: azulScale,
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
        brand: brandScale, // = bermellon
        jade: jadeScale, // = cian
        gold: { 400: goldScale[400], 500: goldScale[500], 600: goldScale[600] }, // = naranja
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