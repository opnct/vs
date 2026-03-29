/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Flat Enterprise Corporate Palette matching the reference images
        brand: {
          black: '#000000',      // Pure black for headers and AI Core sections
          white: '#ffffff',      // Stark white for forms and main foregrounds
          blue: '#0056b3',       // Corporate Enterprise Blue (Buttons, Accents)
          green: '#2ecc71',      // Success Green (Login button, positive actions)
          surface: '#f8f9fa',    // Form Grey (Security Protocols card, background panels)
          text: '#333333',       // Main document text
          muted: '#6c757d',      // Secondary text and hints
          border: '#dee2e6',     // Standard corporate borders
          focus: '#80bdff',      // Input focus ring color (Light blue outline)
        },
        status: {
          green: '#2ecc71',
          red: '#dc3545',
          orange: '#f39c12',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Clean, minimal shadows replacing the old glowing neon effects
        'corporate': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'corporate-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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