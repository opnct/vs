/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict Minimalist Notion-style Palette (Tally.so inspired)
        brand: {
          white: '#FFFFFF',      // Main content background
          sidebar: '#F9F9F9',    // Off-White/Sidebar Gray
          text: '#111111',       // Charcoal Text for primary headings/body
          muted: '#9B9A97',      // Muted Gray Text for secondary labels/icons
          accent: '#0A85D1',     // Accent Blue for primary buttons/links
          border: '#EAEAEA',     // Subtle border grays for dividers
        }
      },
      fontFamily: {
        // Clean, minimalist typography matching the reference
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Minimalist soft shadows replacing hard classic windows shadows
        'minimal': 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px',
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