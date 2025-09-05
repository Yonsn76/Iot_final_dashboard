import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeContextType, ThemeMode } from '../types/theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('iot-dashboard-mode') as ThemeMode;
    return savedMode || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    console.log('Applying theme mode:', themeMode);
    console.log('Root classes before:', Array.from(root.classList));
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(themeMode);
    
    console.log('Root classes after:', Array.from(root.classList));
    
    // Save to localStorage
    localStorage.setItem('iot-dashboard-mode', themeMode);
  }, [themeMode]);

  const toggleThemeMode = (): void => {
    setThemeModeState(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (newMode: ThemeMode): void => {
    setThemeModeState(newMode);
  };

  const value: ThemeContextType = {
    themeMode,
    toggleThemeMode,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};