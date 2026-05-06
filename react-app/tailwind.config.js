export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        stone: { warm: "#FAF8F5", light: "#F5F2ED", mid: "#E8E0D5", dark: "#D5CEC5" },
        charcoal: { DEFAULT: "#2D2D2D", light: "#4A4A4A", deep: "#1a1a1a" },
        olive: { DEFAULT: "#5C6B4F", light: "#7A8B6A", pale: "#e8ede5" },
        muted: { brown: "#7A6652", tan: "#A0937D" },
        stage: { symptom: "#B91C1C", cause: "#1D4ED8", remedy: "#047857", side: "#D97706" },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', '"Courier New"', "monospace"],
      },
    },
  },
  plugins: [],
};
