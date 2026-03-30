/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: '#1e1e1e',         
          sidebar: '#252526',    
          activity: '#333333',   
          accent: '#007acc',     
          text: '#cccccc',       
          textDark: '#858585',   
          string: '#ce9178',     
          keyword: '#569cd6',    
          func: '#dcdcaa',       
          type: '#4ec9b0',       
          border: '#3c3c3c',     
          tabInactive: '#2d2d2d',
          statusBg: '#007acc',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
