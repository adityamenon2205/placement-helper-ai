/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          teal: {
            50: '#edf8fa',
            100: '#d5eff5',
            200: '#aee0ec',
            300: '#78cbe0',
            400: '#43b4d1',
            500: '#2597BB',
            600: '#1C7F9E',
            700: '#16667F',
            800: '#175367',
            900: '#174656',
          },
          blue: {
            50: '#eef6fc',
            100: '#d7ecf8',
            200: '#b5dbf3',
            300: '#82c3eb',
            400: '#47a4df',
            500: '#156BA8',
            600: '#105689',
            700: '#0E466F',
            800: '#0F3B5D',
            900: '#12334E',
          },
          coral: {
            50: '#fef3f1',
            100: '#fee3de',
            200: '#fecdc3',
            300: '#fba99a',
            400: '#f87b64',
            500: '#FC4B2A',
            600: '#e93310',
            700: '#c42609',
            800: '#9f220c',
            900: '#832210',
          },
          warm: {
            50: '#fef8ee',
            100: '#fdedd3',
            200: '#fbd9a5',
            300: '#f8c06e',
            400: '#f5a73e',
            500: '#F99D38',
            600: '#e48016',
            700: '#bd6213',
            800: '#964d17',
            900: '#7b4017',
          },
          cream: {
            50: '#FAF7F2',
            100: '#F5EFE6',
            200: '#EDE4D3',
            300: '#E6CD8A',
            400: '#D6B76A',
            500: '#C19D4D',
            600: '#A7813D',
            700: '#856333',
            800: '#6E502F',
            900: '#5C432A',
          }
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1.0)' },
        }
      }
    },
  },
  plugins: [],
}
