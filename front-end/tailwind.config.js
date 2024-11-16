/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#009ba0",
          "secondary": "#14b8a6",
          "accent": "#00a09e",
          "neutral": "#065f46",
          "base-100": "#1d2c2f",
          "info": "#bae6fd",
          "success": "#67da39",
          "warning": "#fde047",
          "error": "#ef4444",
        },
      },
    ],
  },
};