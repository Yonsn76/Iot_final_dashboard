/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Esto es crucial para que funcione con las clases dark:
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}
