/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Сюда мы будем добавлять кастомные цвета из твоих скриншотов
      colors: {
        primary: '#0056D2', // Примерный синий цвет как у Coursera
      }
    },
  },
  plugins: [],
}