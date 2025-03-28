
import React, { ReactNode } from 'react';
import ThemeToggle from '../shared/ThemeToggle';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('/admin') || 
                      location.pathname === '/secretadminportal';
  
  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle for all pages */}
      <div className={`fixed top-4 right-4 z-50 ${isAdminPage ? 'block' : 'md:block hidden'}`}>
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
};

export default MainLayout;
