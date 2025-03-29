
import React, { ReactNode } from 'react';
import ThemeToggle from '../shared/ThemeToggle';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.includes('admin') || location.pathname.includes('secretadminportal');
  const isIndexPage = location.pathname === '/' || location.pathname === '/index';
  const isChatPage = location.pathname === '/chat';
  const isVipProfilePage = location.pathname === '/vip-profile';
  
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors duration-200">
      {/* Theme toggle visible on all pages except index, chat, and VIP profile pages */}
      {!isIndexPage && !isChatPage && !isVipProfilePage && (
        <div className="fixed top-4 right-4 z-[9999]">
          <ThemeToggle 
            className={isAdminPage 
              ? 'bg-background/10 hover:bg-background/20 rounded-full p-2 text-primary-foreground' 
              : ''}
          />
        </div>
      )}
      
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
