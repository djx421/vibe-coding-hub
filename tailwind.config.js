/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#07c160', light: '#e8f8ef', dark: '#06ad56' },
      },
    },
  },
  plugins: [],
};
