/** @type {import('tailwindcss').Config} */
// Green solder-mask board, copper traces, black IC packages, white silkscreen, glowing signal colors.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        board: { 950: "#04170f", 900: "#072a1c", 800: "#0a3a27", 700: "#0e4d34", 600: "#14684a" },
        // IC package blacks (kept under the name "ink" so shared admin styles keep working)
        ink: { 950: "#070c0a", 900: "#0c1311", 800: "#131c19", 700: "#1c2925", 600: "#2c3e37" },
        copper: { DEFAULT: "#d79a4f", light: "#f2c186", dark: "#8a5a2b" },
        silk: "#e6f0e8",
        signal: { lime: "#7cff6b", cyan: "#38e8ff" },
        accent: { DEFAULT: "#d79a4f", soft: "#f2c186", alt: "#38e8ff" },
      },
    },
  },
  plugins: [],
};
