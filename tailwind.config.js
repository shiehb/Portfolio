/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Departure Mono', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
      maxWidth: {
        '650': '650px',
      },
      animation: {
        marqueeScroll: 'marqueeScroll 30s linear infinite',
        marqueeScrollReverse: 'marqueeScrollReverse 30s linear infinite',
      },
      keyframes: {
        marqueeScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeScrollReverse: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(50%)' },
        },
      },
    },
  },
  plugins: [],
}
