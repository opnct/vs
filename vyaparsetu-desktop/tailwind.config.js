/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep, legible text colors (replacing harsh blacks)
        brand: {
          bg: '#f8f9fb',     // App background
          text: '#2a2845',   // Main headings and text
          muted: '#8e8c9f',  // Subtitles and secondary text
        },
        // Soft pastel colors from the UI reference for module cards
        pastel: {
          pink: '#fbe4df',   // Generate Kundali / Quick Bill color
          peach: '#fae4d1',  // Match / Inventory color
          blue: '#e2e5f8',   // View Panchang / Khata color
          purple: '#ebe8f9', // Progress / Reports color
          yellow: '#fdf1d6', // Saved Items / Extras color
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Heavy, smooth 3D floating effect
        'soft-3d': '0 20px 40px -15px rgba(42, 40, 69, 0.08)',
        'soft-float': '0 10px 30px -10px rgba(42, 40, 69, 0.12)',
      },
      borderRadius: {
        // Extremely rounded corners for the cards
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}