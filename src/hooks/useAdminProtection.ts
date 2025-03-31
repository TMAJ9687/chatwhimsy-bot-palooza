import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminAuthService from '@/services/admin/adminAuthService';

/**
 * Hook to protect admin routes and handle redirects
 */
export const useAdminProtection = (redirectPath: string = '/secretadminportal') => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const redirectAttemptedRef = useRef(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check admin authentication on mount and when location changes
  const checkAdminAuth = useCallback(() => {
    console.log('Checking admin authentication status...');
    console.log('Current path:', location.pathname);
    
    // IMPORTANT: Don't check admin session status if on the login page
    // to prevent immediate redirects
    const adminLoggedIn = location.pathname === '/secretadminportal' 
      ? false 
      : AdminAuthService.isAdminSession();
      
    console.log('Admin logged in:', adminLoggedIn);
    setIsAuthenticated(adminLoggedIn);
    
    // If on admin login page, don't redirect regardless of auth state
    if (location.pathname === '/secretadminportal') {
      console.log('On admin login page, not redirecting');
      setIsLoading(false);
      return;
    }
    
    // If logged in and on an admin page (but not login), stay there
    if (adminLoggedIn && location.pathname.includes('/admin')) {
      console.log('Admin is authenticated on admin page, not redirecting');
      setIsLoading(false);
      return;
    }
    
    // If logged in as admin and on admin login page, redirect to dashboard
    if (adminLoggedIn && location.pathname === '/secretadminportal') {
      console.log('Admin is authenticated on login page, redirecting to dashboard');
      setIsLoading(false);
      navigate('/admin-dashboard');
      return;
    }
    
    // If not logged in as admin and on a protected page, redirect to login
    if (!adminLoggedIn && location.pathname.includes('/admin') && 
        location.pathname !== '/secretadminportal' && !redirectAttemptedRef.current) {
      console.log('Not authenticated as admin, redirecting to:', redirectPath);
      setIsLoading(false);
      redirectAttemptedRef.current = true;
      
      // Use a timeout to avoid infinite redirect loops
      setTimeout(() => {
        navigate(redirectPath);
      }, 100);
      return;
    }
    
    setIsLoading(false);
    console.log('Admin authentication check complete');
  }, [navigate, redirectPath, location.pathname]);
  
  // Reset redirect attempts when location changes
  useEffect(() => {
    if (location.pathname !== '/secretadminportal' && redirectAttemptedRef.current) {
      redirectAttemptedRef.current = false;
    }
    
    // Check admin authentication when location changes
    checkAdminAuth();
    
    // Clean up any existing interval
    if (checkTimeoutRef.current) {
      clearInterval(checkTimeoutRef.current);
    }
    
    // Set up interval to periodically check admin session
    // Use a ref to keep track of the interval for cleanup
    checkTimeoutRef.current = setInterval(() => {
      console.log('Periodic admin session check');
      checkAdminAuth();
    }, 60000); // Check every minute
    
    return () => {
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
    };
  }, [checkAdminAuth, location.pathname]);

  return {
    isAuthenticated,
    isLoading,
    refreshSession: checkAdminAuth
  };
};

export default useAdminProtection;
