/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict 7-Color Corporate Enterprise Palette
        brand: {
          primary: '#005FA3', // Active states, primary buttons, accents
          border: '#58595A',  // Dividers, input borders, structural lines
          bg: '#141414',      // Main application background
          muted: '#A6B5C3',   // Secondary text, inactive icons, placeholders
          light: '#DBE9F2',   // Hover states, subtle highlights
          surface: '#1D1F20', // Cards, modals, floating panels
          text: '#FEFFFE',    // Primary headings and main body text
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Flat/minimal corporate depth (Strictly no neon glows)
        'corporate': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'corporate-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        // Retained smooth micro-interactions for UI responsiveness
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up-fade': 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}