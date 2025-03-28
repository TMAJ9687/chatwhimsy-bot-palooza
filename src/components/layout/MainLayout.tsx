
import React, { ReactNode } from 'react';
import ThemeToggle from '../shared/ThemeToggle';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('admin') || location.pathname.includes('secretadminportal');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle visible on all pages with proper z-index and visibility */}
      <div className={`fixed top-4 right-4 z-[9999] ${isAdminPage ? 'text-white' : ''}`}>
        <ThemeToggle className={isAdminPage ? 'text-primary bg-background/10 hover:bg-background/20 rounded-full p-2' : ''} />
      </div>
      {children}
    </div>
  );
};

export default MainLayout;
