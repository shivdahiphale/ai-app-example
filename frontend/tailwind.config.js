/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        hero: ['"Bebas Neue"', "sans-serif"],
        body: ['"Nunito"', "sans-serif"],
      },
      colors: {
        hero: {
          red: "#E53935",
          blue: "#2962FF",
          yellow: "#FFEB3B",
          green: "#00E676",
          cream: "#FFF4D2",
          ink: "#0F172A",
        },
      },
      boxShadow: {
        comic: "6px 6px 0px 0px #0F172A",
        "comic-sm": "4px 4px 0px 0px #0F172A",
        "comic-xs": "2px 2px 0px 0px #0F172A",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
