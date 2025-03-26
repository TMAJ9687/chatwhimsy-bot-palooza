
import React, { ReactNode } from 'react';
import { UserProvider } from '../../context/UserContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </UserProvider>
  );
};

export default MainLayout;
