/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        np: {
          bg: '#202020',         
          menuBg: '#181818',     
          tabActive: '#2d2d2d',  
          tabHover: '#2a2a2a',   
          text: '#ffffff',       
          muted: '#9d9d9d',      
          accent: '#4cc2ff',     
          border: '#333333',     
          actionBg: '#282828',   
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
