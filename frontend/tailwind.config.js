/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  content: ['./index.html', './src/**/*.{js,jsx}'],

  theme: {
    extend: {
      // Premium automotive accent (warm gold/amber) — replaces the generic
      // indigo placeholder from Phase 1. Same token name ("brand") so
      // existing references (VehicleCard, Loader, NotFound) pick this up
      // automatically without needing to be touched.
      colors: {
        brand: {
          50: '#fdf8ec',
          100: '#faedc7',
          200: '#f3da8f',
          300: '#eabf52',
          400: '#e0ab2e',
          500: '#c8951f',
          600: '#a67818',
          700: '#835f14',
          800: '#6b4d13',
          900: '#5a4014',
        },
      },

      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },

  plugins: [],
};