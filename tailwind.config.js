/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.tsx", "./components/**/*.tsx"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // <-- add this
  theme: {
    extend: {},
  },
  plugins: [],
};
