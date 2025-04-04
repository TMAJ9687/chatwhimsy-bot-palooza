
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(false);

  // Check for system preference or saved preference on mount
  useEffect(() => {
    const loadThemePreference = () => {
      const savedTheme = localStorage.getItem('theme');
      const isDarkMode = 
        savedTheme === 'dark' || 
        (savedTheme !== 'light' && 
          document.documentElement.classList.contains('dark') ||
          (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
      
      setIsDark(isDarkMode);
      
      // Set the initial class on the document element based on the detected theme
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    loadThemePreference();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        loadThemePreference();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
          ? 'text-gray-200 hover:bg-gray-700' 
          : 'text-gray-700 hover:bg-gray-100'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
