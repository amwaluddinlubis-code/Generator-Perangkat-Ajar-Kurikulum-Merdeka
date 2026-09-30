import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  set: (theme: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: 'light',
  toggle: () => {},
  set: () => {},
});

export const useTheme = () => useContext(Ctx);

const KEY = 'rgm-theme';

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // Browser storage / matchMedia may be unavailable during SSR or tests.
  }
  return 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;

    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // Preference persistence is best-effort.
    }
  }, [theme]);

  const value: ThemeCtx = {
    theme,
    toggle: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
    set: setTheme,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
