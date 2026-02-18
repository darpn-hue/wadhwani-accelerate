/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',  // Backgrounds
          100: '#ffedd5', // Light accents
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary Brand Color
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        peach: {
          50: '#FFF5F1', // The very light chat background
          100: '#FFE4D6', // Gradient start
        }
      },
      backgroundImage: {
        'meetul-gradient': 'linear-gradient(135deg, #FFE4D6 0%, #FFF5F1 50%, #FFFFFF 100%)',

      },
    },

  },
  plugins: [],
}

