

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"], // Enable dark mode toggling via class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))', // Primary background
        foreground: 'hsl(var(--foreground))', // Primary text
        card: {
          DEFAULT: 'hsl(var(--card))', // Secondary background
          foreground: 'hsl(var(--card-foreground))', // Card text
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))', // Popover background
          foreground: 'hsl(var(--popover-foreground))', // Popover text
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))', // Primary action color
          foreground: 'hsl(var(--primary-foreground))', // Primary text
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // Secondary color
          foreground: 'hsl(var(--secondary-foreground))', // Secondary text
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // Muted elements
          foreground: 'hsl(var(--muted-foreground))', // Muted text
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // Highlight/Accent
          foreground: 'hsl(var(--accent-foreground))', // Accent text
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))', // Error/Warning
          foreground: 'hsl(var(--destructive-foreground))', // Error text
        },
        border: 'hsl(var(--border))', // Border color
        input: 'hsl(var(--input))', // Input background
        ring: 'hsl(var(--ring))', // Focus/hover ring
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)', // Larger corners
        md: 'calc(var(--radius) - 2px)', // Medium corners
        sm: 'calc(var(--radius) - 4px)', // Small corners
        xl: '1rem', // Extra-large corners
        none: '0', // No radius
      },
      boxShadow: {
        glow: '0 0 15px rgba(102, 252, 241, 0.6)', // Glow effect for accents
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // Add tailwind animation plugin
} satisfies Config;
