/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict Tally Prime Desktop UI Palette
        tally: {
          darkBlue: '#1E487C',   // Top main navbar
          cyan: '#5793C4',       // Secondary headers / active path
          lightBlue: '#E8F1F8',  // Right menu backgrounds & utilities
          yellow: '#F9CB41',     // Active selection highlight
          bg: '#E8EDF2',         // Main application background (Dashboard space)
          white: '#FFFFFF',      // Pure white for data panels and tables
          black: '#000000',      // Strict black for dense data text
          border: '#A9B9C6',     // Thin grey/blue borders for classic windows
          headerText: '#A1C8E1', // Light blue inactive text on dark blue background
        }
      },
      fontFamily: {
        // Tally uses classic, dense system fonts for maximum data visibility
        sans: ['Tahoma', 'Arial', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Tally uses very flat, thin-bordered UI. Retaining a sharp shadow only for modals.
        'tally-window': '2px 2px 8px rgba(0, 0, 0, 0.25)',
      },
      keyframes: {
        // Retained functional micro-interactions
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
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-up': 'scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up-fade': 'slideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}