import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aubergine: "#2B1B3D",
        marigold: "#F5B427",
        peacock: "#0F7B83",
        hibiscus: "#D6336C",
        mist: "#F4F3F8",
        white: "#FFFFFF",
        ink: {
          70: "rgba(43, 27, 61, 0.70)",
          12: "rgba(43, 27, 61, 0.12)",
        },
      },
      fontFamily: {
        display: ["'Young Serif'", "Georgia", "serif"],
        body: ["'Hind'", "'Noto Sans Devanagari'", "system-ui", "sans-serif"],
      },
      fontSize: {
        "t-xs": "0.8rem",
        "t-sm": "0.9rem",
        "t-md": "1rem",
        "t-lg": "1.25rem",
        "t-xl": "1.56rem",
        "t-2xl": "1.95rem",
        "t-3xl": "2.44rem",
      },
      borderRadius: {
        dial: "999px",
        hero: "28px",
        chip: "999px",
        sheet: "24px 24px 0 0",
        field: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
