/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        np: {
          bg: '#202020',         // Notepad background
          menuBg: '#181818',     // Titlebar/Menu background
          tabActive: '#2d2d2d',  // Active tab
          tabHover: '#2a2a2a',   // Tab hover
          text: '#ffffff',       // Main text
          muted: '#9d9d9d',      // Placeholder/Muted
          accent: '#4cc2ff',     // Selection/Active blue
          border: '#333333',     // Subtle borders
          actionBg: '#282828',   // Formatting bar bg
        }
      },
      fontFamily: {
        mono: ['Consolas', '"Courier New"', 'monospace'],
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
