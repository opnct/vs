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
          white: '#FFFFFF',      // Main content background
          sidebar: '#F9F9F9',    // Off-White/Sidebar Gray
          text: '#111111',       // Charcoal Text for headings/body
          muted: '#9B9A97',      // Muted Gray Text for secondary labels
          accent: '#0A85D1',     // Accent Blue for primary buttons/links
          border: '#EAEAEA',     // Subtle border grays for dividers
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
