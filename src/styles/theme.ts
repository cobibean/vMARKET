export type Colors = {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  ring: string;
};

export type Radius = {
  sm: string;
  md: string;
  lg: string;
  full: string;
};

export type FontSizes = {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
};

export type Spacing = {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
};

export const lightColors: Colors = {
  background: 'hsl(0 0% 97%)',
  foreground: 'hsl(0 0% 5%)',
  primary: 'hsl(174 71% 56%)', // Turquoise
  primaryForeground: 'hsl(0 0% 5%)',
  secondary: 'hsl(0 0% 90%)',
  secondaryForeground: 'hsl(0 0% 10%)',
  accent: 'hsl(39 100% 50%)', // Orange
  accentForeground: 'hsl(0 0% 10%)',
  destructive: 'hsl(0 84% 60%)',
  destructiveForeground: 'hsl(0 0% 95%)',
  muted: 'hsl(0 0% 90%)',
  mutedForeground: 'hsl(0 0% 40%)',
  card: 'hsl(0 0% 100%)',
  cardForeground: 'hsl(0 0% 5%)',
  border: 'hsl(0 0% 80%)',
  input: 'hsl(0 0% 80%)',
  ring: 'hsl(174 71% 56%)',
};

export const darkColors: Colors = {
  background: 'hsl(0 0% 10%)',
  foreground: 'hsl(0 0% 95%)',
  primary: 'hsl(174 71% 56%)', // Turquoise
  primaryForeground: 'hsl(0 0% 10%)',
  secondary: 'hsl(0 0% 15%)',
  secondaryForeground: 'hsl(0 0% 95%)',
  accent: 'hsl(39 100% 50%)', // Orange
  accentForeground: 'hsl(0 0% 10%)',
  destructive: 'hsl(0 84% 60%)',
  destructiveForeground: 'hsl(0 0% 95%)',
  muted: 'hsl(0 0% 15%)',
  mutedForeground: 'hsl(0 0% 60%)',
  card: 'hsl(0 0% 12%)',
  cardForeground: 'hsl(0 0% 95%)',
  border: 'hsl(0 0% 25%)',
  input: 'hsl(0 0% 25%)',
  ring: 'hsl(174 71% 56%)',
};

export const radius: Radius = {
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  full: '9999px',
};

export const fontSize: FontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
};

export const spacing: Spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

export const fonts = {
  body: "'Exo 2', system-ui, sans-serif",
  heading: "'Orbitron', sans-serif",
  mono: "'Share Tech Mono', monospace",
};

const theme = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  radius,
  fontSize,
  spacing,
  fonts,
};

export default theme; 