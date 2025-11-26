import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default withUt(config);
