
import React from 'react';
import AdminNav from '../shared/AdminNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <AdminNav />
    </div>
  );
};

export default MainLayout;
