
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import useAdminProtection from './useAdminProtection';
import useAdminUser from './useAdminUser';
import AdminAuthService from '@/services/admin/adminAuthService';

/**
 * Hook to manage admin session persistence and protection
 * @param redirectPath Path to redirect to if not authenticated
 * @returns Object containing admin session state
 */
export const useAdminSession = (redirectPath: string = '/secretadminportal') => {
  const location = useLocation();
  const { user } = useUser();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use our refactored hooks
  const { isAuthenticated, isLoading: protectionLoading, refreshSession } = 
    useAdminProtection(redirectPath);
  const { isLoading: userLoading, redirectToDashboardIfAdmin } = useAdminUser();
  
  // Combined loading state
  const isLoading = protectionLoading || userLoading;
  
  // Check if we should redirect to dashboard (only on the login page)
  const checkForDashboardRedirect = useCallback(() => {
    const adminSessionActive = AdminAuthService.isAdminSession();
    
    if (location.pathname === '/secretadminportal' && 
        !redirectAttempted && 
        (isAuthenticated || user?.isAdmin || adminSessionActive)) {
      setRedirectAttempted(true);
      redirectToDashboardIfAdmin();
    }
  }, [location.pathname, redirectAttempted, isAuthenticated, user?.isAdmin, redirectToDashboardIfAdmin]);
  
  // Reset redirect flag when path changes
  useEffect(() => {
    if (location.pathname !== '/secretadminportal' && redirectAttempted) {
      setRedirectAttempted(false);
    }
    
    // Set up admin session check
    if (!sessionCheckIntervalRef.current) {
      sessionCheckIntervalRef.current = setInterval(() => {
        // Check admin session status
        const { isActive } = AdminAuthService.checkAdminSession();
        
        // If admin session changes, refresh the session
        if (isActive !== isAuthenticated) {
          refreshSession();
        }
      }, 30000); // Check every 30 seconds
    }
    
    // Clean up interval
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    };
  }, [location.pathname, redirectAttempted, isAuthenticated, refreshSession]);
  
  return {
    isAuthenticated: isAuthenticated || Boolean(user?.isAdmin) || AdminAuthService.isAdminSession(),
    isLoading,
    user,
    refreshSession,
    checkForDashboardRedirect
  };
};

export default useAdminSession;
