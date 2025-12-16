/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This sets Outfit as the default font for the class 'font-sans'
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}