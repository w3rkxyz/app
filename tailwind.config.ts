import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xxxl: { max: "3019px" },
      xxl: { max: "2560px" },
      xl: { max: "1920px" },
      "desktop-l": { max: "1880px" },
      "desktop-m": { max: "1680px" },
      "laptop-x": { max: "1440px" },
      "laptop-m": { max: "1280px" },
      "nav-lg": { max: "1328px" },
      "profile-md": { max: "1450px" },
      "profile-sm": { max: "1340px" },
      "banner-tablet": { max: "1060px" },
      "tablet-notifications": { max: "855px" },
      "settings-small": { max: "1069px" },
      "settings-xs": { max: "890px" },
      lg: { max: "1190px" },
      md: { max: "991px" },
      sm: { max: "767px" },
      xs: { max: "414px" },
      xxs: { max: "375px" },
      "2xl": "1921px",
      DEFAULT: "1576px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "26px",
        xxl: "3rem",
        xl: "3rem",
        lg: "3rem",
        md: "30px",
        sm: "18px",
        xs: "15px",
      },
    },

    fontFamily: {
      primary: ["Inter", "sans-serif"],
      secondary: ["Inter", "sans-serif"],
    },
    fontSize: {},
    extend: {
      colors: {
        primary: "#A274FF",
        "light-primary": "#A274FF80",
        secondary: "#120037",
        accent: "#A274FF",
        dark: "#000000",
        "dark-gray": "#00000080",
        "white-gray": "#F5F5F5",
        white: "#ffffff",
      },
      backgroundImage: {
        "inner-cta":
          "linear-gradient(96.34deg,#926AFF 0%,#FF77B0 50%,#FFB367 100%)",
      },
      gridTemplateColumns: {
        "16": "repeat(16, minmax(0, 1fr))",
      },
      gridColumn: {
        "span-13": "span 13 / span 13",
        "span-14": "span 14 / span 14",
        "span-15": "span 15 / span 15",
        "span-16": "span 16 / span 16",
      },
    },
  },
  plugins: [],
};
export default config;
