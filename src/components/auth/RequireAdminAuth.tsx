
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

const RequireAdminAuth: React.FC<RequireAdminAuthProps> = ({ children }) => {
  const { user, isAdmin } = useUser();

  if (!user) {
    // Redirect to login if no user is authenticated
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect to home if user is not an admin
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is an admin, render the children
  return <>{children}</>;
};

export default RequireAdminAuth;
