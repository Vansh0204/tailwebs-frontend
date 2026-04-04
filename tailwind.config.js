/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#f87171', // lighter red
          DEFAULT: '#ef4444', // red-500
          dark: '#b91c1c', // red-700
        }
      }
    },
  },
  plugins: [],
}
