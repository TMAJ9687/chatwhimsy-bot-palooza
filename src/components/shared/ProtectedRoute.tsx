
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVip?: boolean;
  allowAnonymous?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireVip = false,
  allowAnonymous = true
}) => {
  const { currentUser, isLoading, isAnonymous } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access this page.",
          variant: "destructive"
        });
      } else if (!allowAnonymous && isAnonymous) {
        toast({
          title: "Full Account Required",
          description: "This feature requires a registered account.",
          variant: "destructive"
        });
      }
    }
  }, [isLoading, currentUser, requireAuth, allowAnonymous, isAnonymous, toast]);

  if (isLoading) {
    // You could show a loading spinner here
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Check if authentication is required and user is not logged in
  if (requireAuth && !currentUser) {
    // Redirect to login with a return URL
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if anonymous users are not allowed and current user is anonymous
  if (!allowAnonymous && isAnonymous) {
    // Redirect to upgrade account page
    return <Navigate to="/vip-signup" state={{ from: location }} replace />;
  }

  // If we require VIP, check user's VIP status
  if (requireVip) {
    // We'll need to check this from the user context or profile
    // This is a placeholder implementation
    const userContext = { isVip: false }; // Replace with actual user context
    
    if (!userContext.isVip) {
      return <Navigate to="/vip-subscription" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
