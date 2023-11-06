import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'hero': 'url("/images/hero-bg.svg")',
        'gradient-radial': 'radial-gradient(125% 300% at center -200%, var(--tw-gradient-stops))',
      },
    },
  },
  daisyui: {
    themes: [
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        light: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
          ...require("daisyui/src/theming/themes")["[data-theme=winter]"],
          // primary: "#FF65B3",
          // secondary: "rgb(56, 58, 107)",
          // "primary-content": "#FFFFFF",
          // "secondary-content": "#FFFFFF",
          // "base-content": "rgb(56, 58, 107)"
        },
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        dark: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
          ...require("daisyui/src/theming/themes")["[data-theme=dracula]"],
          primary: "rgb(5, 122, 255)",
          // secondary: "rgb(56, 58, 107)",
        },
      },
    ],
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    require("daisyui"), 
    require('@tailwindcss/typography')
  ],
} satisfies Config;
