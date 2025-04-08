
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Redirect to login if no user is authenticated
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the children
  return <>{children}</>;
};

export default RequireAuth;
