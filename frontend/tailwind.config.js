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
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#94bfe0',
          400: '#5e9ed0',
          500: '#3880be',
          600: '#2665a3',
          700: '#1e4f83',
          800: '#1c446e',
          900: '#1b3a5d',
          950: '#0f243d', // Deep institutional navy
        },
        navy: {
          50: '#f4f6f9',
          100: '#e8edf3',
          200: '#ccd8e6',
          300: '#a3b9d3',
          400: '#7395bd',
          500: '#5078a6',
          600: '#3c5e89',
          700: '#314c70',
          800: '#2b415e',
          900: '#1b2a3f',
          950: '#0e1724',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          subtle: '#f1f5f9',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'modal': '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      }
    },
  },
  plugins: [],
}
