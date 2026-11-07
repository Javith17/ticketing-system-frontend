import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

const STORAGE_KEY = 'ticketing-theme-mode';

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => getAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
