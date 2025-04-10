
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  
  // Check admin authentication on mount and when location changes
  const checkAdminAuth = useCallback(async () => {
    console.log('Checking admin authentication status...');
    
    // Don't check admin logged in status if on the login page
    if (location.pathname === '/secretadminportal' || 
        location.pathname === '/admin-login' || 
        location.pathname === '/admin') {
      console.log('On admin login page, skipping auth check');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    
    try {
      const adminLoggedIn = await adminService.isAdminLoggedIn();
      console.log('Admin logged in check result:', adminLoggedIn);
      setIsAuthenticated(adminLoggedIn);
      
      // If not logged in as admin and on a protected page, redirect to login
      // but only if we've already tried a couple of times to avoid redirect loops
      if (!adminLoggedIn && location.pathname.includes('/admin') && checkAttempts >= 1) {
        console.log('Not authenticated as admin, redirecting to login page');
        navigate(redirectPath);
      }
      
      // Increment the check attempts
      setCheckAttempts(prev => prev + 1);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking admin authentication:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [navigate, redirectPath, location.pathname, checkAttempts]);
  
  // Check admin authentication when location changes
  useEffect(() => {
    checkAdminAuth();
    
    // Set up interval to periodically check admin session
    const intervalId = setInterval(() => {
      checkAdminAuth();
    }, 300000); // Check every 5 minutes
    
    return () => {
      clearInterval(intervalId);
    };
  }, [checkAdminAuth]);

  return {
    isAuthenticated,
    isLoading,
    refreshSession: checkAdminAuth
  };
};

export default useAdminProtection;
