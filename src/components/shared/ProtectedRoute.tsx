
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVip?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireVip = false 
}) => {
  const { currentUser, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && requireAuth && !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "destructive"
      });
    }
  }, [isLoading, currentUser, requireAuth, toast]);

  if (isLoading) {
    // You could show a loading spinner here
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (requireAuth && !currentUser) {
    // Redirect to login with a return URL
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If we require VIP, we should implement that check here too
  // This would require more integration with the user profile system

  return <>{children}</>;
};

export default ProtectedRoute;
