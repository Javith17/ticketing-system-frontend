// SPZ Brand Colour Palette — see "SPZ Brand Theme Colour Palette Annex" for source values.
export const brand = {
  // Core brand
  indigo: '#29166F',
  gold: '#E5A823',

  // Primary indigo scale
  indigo50: '#F4F1FB',
  indigo100: '#E7E2F6',
  indigo200: '#C6BCEA',
  indigo300: '#9A8AD9',
  indigo400: '#6C57C9',
  indigo500: '#4B32B0',
  indigo600: '#372091',
  indigo700: '#29166F',
  indigo800: '#211257',
  indigo900: '#1A0E4A',

  // Gold accent scale
  gold100: '#FBEECC',
  gold400: '#F0BC4E',
  gold500: '#E5A823',
  gold600: '#B8860B',

  // Semantic / status colours
  success: '#2E9E5B',
  warning: '#E08600',
  danger: '#C7402F',
  info: '#2C6FB0',

  // Light mode neutrals
  bgLight: '#FFFFFF',
  surfaceLight: '#F7F7FA',
  borderLight: '#E2E2EA',
  textLight: '#1A1A2E',
  textLight2: '#5A5A6E',

  // Dark mode neutrals
  bgDark: '#14122A',
  surfaceDark: '#1F1B3D',
  elevatedDark: '#2A2550',
  borderDark: '#39335F',
  primaryDark: '#8F7EDC',
  accentDark: '#F0BC4E',
  textDark: '#F2F1F8',
  textDark2: '#B8B4D0',
};

// The side navigation rail is a fixed dark surface regardless of the app's
// light/dark mode, so it draws its own tokens rather than the mode-reactive
// theme palette.
export const sidenav = {
  bg: brand.indigo900,
  border: brand.borderDark,
  accent: brand.gold500,
  accentIcon: brand.gold400,
  textPrimary: brand.textDark,
  textSecondary: brand.indigo200,
  textMuted: brand.indigo300,
  hoverBg: brand.elevatedDark,
  selectedBg: brand.indigo700,
  selectedHoverBg: brand.indigo600,
};
