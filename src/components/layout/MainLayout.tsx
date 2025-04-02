
import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('admin') || location.pathname.includes('secretadminportal');
  
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors duration-200">
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
