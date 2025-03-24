
import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = React.useState(false);

  // Check for system preference or saved preference on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-1.5 rounded-full transition-colors ${
        isDark 
          ? 'hover:bg-gray-700 bg-gray-800/50' 
          : 'hover:bg-gray-100 bg-white/50'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Moon className="h-5 w-5 text-gray-200" />
      ) : (
        <Sun className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle;
