/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/views/**/*.vue",
  ],
  safelist: ["bg-white", "shadow-sm"],
  theme: {
    extend: {
      colors: {
        primary: "#DE2A02",
      },
    },
  },
  plugins: [],
};
