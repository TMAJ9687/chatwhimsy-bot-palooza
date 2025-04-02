
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as adminService from '@/services/admin/adminService';

/**
 * Hook to protect admin routes and handle redirects
 */
export const useAdminProtection = (redirectPath: string = '/secretadminportal') => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check admin authentication on mount and when location changes
  const checkAdminAuth = useCallback(async () => {
    console.log('Checking admin authentication status...');
    console.log('Current path:', location.pathname);
    
    // IMPORTANT: Don't check admin logged in status if on the login page
    // to prevent immediate redirects
    if (location.pathname === '/secretadminportal') {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    
    try {
      const adminLoggedIn = await adminService.isAdminLoggedIn();
      console.log('Admin logged in (service):', adminLoggedIn);
      setIsAuthenticated(adminLoggedIn);
      
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
          location.pathname !== '/secretadminportal' && !redirectAttempted) {
        console.log('Not authenticated as admin, redirecting to:', redirectPath);
        setIsLoading(false);
        setRedirectAttempted(true);
        
        // Clear any stale admin data
        localStorage.removeItem('adminEmail');
        
        // Use a timeout to avoid infinite redirect loops
        setTimeout(() => {
          navigate(redirectPath);
        }, 100);
        return;
      }
      
      setIsLoading(false);
      console.log('Admin authentication check complete');
    } catch (error) {
      console.error('Error checking admin authentication:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [navigate, redirectPath, location.pathname, redirectAttempted]);
  
  // Reset redirect attempts when location changes
  useEffect(() => {
    if (location.pathname !== '/secretadminportal' && redirectAttempted) {
      setRedirectAttempted(false);
    }
    
    // Check admin authentication when location changes
    checkAdminAuth();
    
    // Set up interval to periodically check admin session
    const intervalId = setInterval(() => {
      console.log('Periodic admin session check');
      checkAdminAuth();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [checkAdminAuth, location.pathname, redirectAttempted]);

  return {
    isAuthenticated,
    isLoading,
    refreshSession: checkAdminAuth
  };
};

export default useAdminProtection;
