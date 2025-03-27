
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AdminUser, adminService } from '@/services/admin/AdminService';

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, you would make an API call to authenticate
    // For now, we're using mock data with a simple check
    // Note: In production, use proper auth with secure password handling
    
    if (username === 'admin' && password === 'admin123') {
      const adminUser = adminService.getAdminByUsername(username);
      if (adminUser) {
        setAdmin(adminUser);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        login,
        logout
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
