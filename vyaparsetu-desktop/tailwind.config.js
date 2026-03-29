/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep, modern dark mode palette matching the reference image layered design
        brand: {
          black: '#000000',    // Pure black for the rightmost/main content panel
          dark: '#0a0a0a',     // Ultra-dark background for the sidebar
          surface: '#1c1c1e',  // Elevated cards and middle panels
          blue: '#007AFF',     // Vivid blue for active states and glowing popovers
          text: '#ffffff',     // Main headings and primary text
          muted: '#888888',    // Subtitles, search bar, and secondary text
          border: '#2a2a2a',   // Subtle borders between elements
        },
        // Exact pastel accent colors from the reference dashboard
        pastel: {
          blue: '#e3ebff',     // Total earning card
          yellow: '#ffeeba',   // Total spendings card
          green: '#c5ecd7',    // Spending goal card
        },
        // macOS window control buttons
        mac: {
          red: '#FF5F56',
          yellow: '#FFBD2E',
          green: '#27C93F',
        },
        // Status indicator dots and transaction text colors
        status: {
          green: '#4ade80',    // Positive transactions (e.g. + $685.00)
          red: '#f87171',      // Negative transactions (e.g. - $510.50)
          orange: '#F5A623',   // Offline / Warning
          purple: '#B39DDB',   // Miscellaneous accents
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Updated shadows to blend smoothly into pure black layers
        'soft-3d': '0 20px 40px -15px rgba(0, 0, 0, 0.8)',
        'soft-float': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
        // Glowing popover shadows for the vibrant blue floating action menus
        'glow-blue': '0 10px 40px -10px rgba(0, 122, 255, 0.5), 0 0 20px 5px rgba(0, 122, 255, 0.2)',
        'popover': '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 20px -5px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        // Expanded to include the extreme rounded corners from the design
        '4xl': '2rem',     // 32px
        '5xl': '2.5rem',   // 40px
        '6xl': '3rem',     // 48px - Highly rounded corners for main layout panels
      },
      keyframes: {
        // Smooth fade-ins and scale-up modal animations for premium micro-interactions
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