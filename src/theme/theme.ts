import { createTheme, type ThemeOptions } from '@mui/material/styles';
import { brand } from './palette';

const baseOptions: ThemeOptions = {
  typography: {
    fontFamily: `'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontFamily: 'monospace', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
  },
};

export function getAppTheme(mode: 'light' | 'dark') {
  const isLight = mode === 'light';
  return createTheme({
    ...baseOptions,
    palette: {
      mode,
      primary: isLight
        ? { main: brand.indigo700, light: brand.indigo100, dark: brand.indigo900, contrastText: '#FFFFFF' }
        : { main: brand.primaryDark, light: brand.elevatedDark, dark: brand.indigo600, contrastText: brand.bgDark },
      secondary: isLight
        ? { main: brand.gold500, contrastText: brand.textLight }
        : { main: brand.accentDark, contrastText: brand.bgDark },
      error: { main: brand.danger },
      warning: { main: brand.warning },
      success: { main: brand.success },
      info: { main: brand.info },
      background: {
        default: isLight ? brand.bgLight : brand.bgDark,
        paper: isLight ? brand.surfaceLight : brand.surfaceDark,
      },
      divider: isLight ? brand.borderLight : brand.borderDark,
      text: {
        primary: isLight ? brand.textLight : brand.textDark,
        secondary: isLight ? brand.textLight2 : brand.textDark2,
      },
    },
  });
}
