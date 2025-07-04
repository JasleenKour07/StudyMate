/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./APP/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable dark mode support
  theme: {
    extend: {},
  },
  plugins: [],
};
