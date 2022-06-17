/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  important: true,
  theme: {
    extend: {
      animation: {},
      fontFamily: {
        gothamBlack: ["gothamBlack"],
        gotham: ["gotham"],
        gothamMedium: ["gothamMedium"],
        gothamThin: ["gothamThin"],
        gothamLight: ["gothamLight"],
        gothamBold: ["gothamBold"],
        gothamBoldItalic: ["gothamBoldItalic"],
        gothamItalic: ["gothamItalic"],
        gothamMediumItalic: ["gothamMediumItalic"],
      },
      colors: {
        graybg: "#f0f2f5",
        primary: "#ea580c",
        secondary: "#dc2626",
      },
    },
  },
  plugins: [],
};
