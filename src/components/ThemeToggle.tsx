import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, toggleThemeMode } = useTheme();

  const handleToggle = () => {
    console.log('Current theme mode:', themeMode);
    toggleThemeMode();
    console.log('Theme toggle clicked');
  };

  return (
            <button
          className="w-full p-4 glass-effect hover:bg-white/40 dark:hover:bg-black/40 transition-all duration-500 flex items-center justify-center space-x-3 border border-white/30 shadow-lg hover:shadow-xl"
          onClick={handleToggle}
          title={`Cambiar a modo ${themeMode === 'light' ? 'oscuro' : 'claro'}`}
        >
      {themeMode === 'light' ? (
        <>
                           <Moon size={18} className="text-black" />
                 <span className="text-sm font-bold text-black">Modo Oscuro</span>
        </>
      ) : (
        <>
                   <Sun size={18} className="text-white" />
                          <span className="text-sm font-bold text-white">Modo Claro</span>
        </>
      )}
    </button>
  );
};
