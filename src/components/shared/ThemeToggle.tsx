
import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Here you would normally apply the theme changes to the document
    // For example: document.documentElement.classList.toggle('dark')
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-1 rounded-full hover:bg-gray-100 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Moon className="h-5 w-5 text-gray-700" />
      ) : (
        <Sun className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle;
