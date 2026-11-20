/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        royal: "#6C3BCE",
        deep: "#32145F",
        accent: "#A78BFA",
        surface: "#F8F6FC",
        ink: "#191523",
        line: "#E9E4F4",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans Variable", "Noto Sans Arabic Variable", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans Variable", "Noto Sans Arabic Variable", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(25,21,35,0.04), 0 8px 24px rgba(50,20,95,0.07)",
        lift: "0 4px 12px rgba(25,21,35,0.08), 0 16px 40px rgba(50,20,95,0.12)",
      },
    },
  },
  plugins: [],
};
