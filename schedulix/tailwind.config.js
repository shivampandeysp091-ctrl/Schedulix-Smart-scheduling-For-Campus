// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // CRUCIAL: This array tells Tailwind where to find your classes.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};