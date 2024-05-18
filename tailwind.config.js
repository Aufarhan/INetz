/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}", "./*.{html,css,js}"],
  theme: {
    fontFamily: {
      "Inria Sans": ["Inria Sans", "sans-serif"],
    },
    container: {
      center: true,
      padding: "16px",
    },
    extend: {
      colors: {
        primary: "#4D2424",
        secondary: "#0f172a",
        button: "#f59e0b",
      },
    },
  },
  plugins: [],
};
