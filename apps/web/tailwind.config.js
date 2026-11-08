/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#05050b",
          bg2: "#0b0b16",
          surface: "#111120",
          surface2: "#181828",
          border: "#2a2a3d",
          purple: "#b026ff",
          purple2: "#7c3aed",
          blue: "#00d4ff",
          blue2: "#3b82f6",
          cyan: "#22d3ee",
          teal: "#2dd4bf",
          red: "#ff3b3b",
          red2: "#dc2626",
          orange: "#ff7a18",
          gold: "#ffd700",
          green: "#22c55e",
          text: "#ececf5",
          text2: "#a6a6c0",
          text3: "#72728c",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.45s ease-out",
        "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
        scan: "scan 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.35)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      boxShadow: {
        glow: "0 0 22px -6px rgba(176, 38, 255, 0.5)",
        glowBlue: "0 0 22px -6px rgba(0, 212, 255, 0.5)",
        glowRed: "0 0 22px -6px rgba(255, 59, 59, 0.5)",
        glowGold: "0 0 22px -6px rgba(255, 215, 0, 0.45)",
        card: "0 4px 24px -8px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
