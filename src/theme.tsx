import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {}, set: () => {} });

export const useTheme = () => useContext(Ctx);

const KEY = 'rgm-theme';

function initial(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* abaikan */ }
  return 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(KEY, theme);
    } catch { /* abaikan */ }
  }, [theme]);

  return (
    <Ctx.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')), set: setTheme }}>
      {children}
    </Ctx.Provider>
  );
};
