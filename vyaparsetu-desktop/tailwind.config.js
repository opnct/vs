/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vscode: {
          bg: '#1e1e1e',         // Editor background
          sidebar: '#252526',    // Explorer background
          activity: '#333333',   // Leftmost icon bar
          accent: '#007acc',     // VS Code Blue highlight
          text: '#cccccc',       // Default text
          textDark: '#858585',   // Muted text/comments
          string: '#ce9178',     // Syntax: string
          keyword: '#569cd6',    // Syntax: keyword
          func: '#dcdcaa',       // Syntax: function
          type: '#4ec9b0',       // Syntax: type/success
          border: '#3c3c3c',     // Editor borders
          tabActive: '#1e1e1e',
          tabInactive: '#2d2d2d',
          statusBg: '#007acc',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
