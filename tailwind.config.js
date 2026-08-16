/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1fb5ad',
        secondary: '#14b8a6',
        background: {
          dark: '#0a1f1f',
          medium: '#0d4d4d',
          light: '#1a7a7a',
        },
        text: {
          white: '#ffffff',
          gray: '#e5e5e5',
        },
      },
      boxShadow: {
        'teal-glow': '0 0 20px rgba(31, 181, 173, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}