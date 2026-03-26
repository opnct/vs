/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep, modern dark mode palette replacing the old pastels
        brand: {
          dark: '#1a1a1a',     // Main app background (right panel)
          surface: '#252525',  // Sidebar and Card background (left panel)
          blue: '#007AFF',     // Vivid blue for the active menu pill
          text: '#ffffff',     // Main headings and primary text
          muted: '#a1a1aa',    // Subtitles, search bar, and secondary text
        },
        // macOS window control buttons
        mac: {
          red: '#FF5F56',
          yellow: '#FFBD2E',
          green: '#27C93F',
        },
        // Status indicator dots from the reference image
        status: {
          green: '#8BC34A',    // e.g., Shopping list dot
          orange: '#F5A623',   // e.g., Guidance dot
          purple: '#B39DDB',   // e.g., Design meeting dot
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Updated shadows to blend smoothly in dark mode
        'soft-3d': '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
        'soft-float': '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        // Keeping the soft, rounded feel but suited for dark mode
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}