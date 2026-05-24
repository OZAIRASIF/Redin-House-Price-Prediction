/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 enables dark mode via a "dark" class
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // your App Router files
    "./src/components/**/*.{js,ts,jsx,tsx}", // any components
    "./pages/**/*.{js,ts,jsx,tsx}" // if you have pages folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
