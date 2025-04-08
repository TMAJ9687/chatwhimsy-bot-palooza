
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

const RequireAdminAuth: React.FC<RequireAdminAuthProps> = ({ children }) => {
  const { user } = useUser();

  if (!user || !user.isAdmin) {
    // Redirect to admin login if not admin
    return <Navigate to="/secretadminportal" replace />;
  }

  // Admin user is authenticated, render the children
  return <>{children}</>;
};

export default RequireAdminAuth;
