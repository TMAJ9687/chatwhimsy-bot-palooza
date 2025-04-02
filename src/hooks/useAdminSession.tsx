
import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import useAdminProtection from './useAdminProtection';
import useAdminUser from './useAdminUser';

/**
 * Hook to manage admin session persistence and protection
 * @param redirectPath Path to redirect to if not authenticated
 * @returns Object containing admin session state
 */
export const useAdminSession = (redirectPath: string = '/secretadminportal') => {
  const location = useLocation();
  const { user } = useUser();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Use our refactored hooks
  const { isAuthenticated, isLoading: protectionLoading, refreshSession } = 
    useAdminProtection(redirectPath);
  const { isLoading: userLoading, redirectToDashboardIfAdmin } = useAdminUser();
  
  // Combined loading state
  const isLoading = protectionLoading || userLoading;
  
  // Check if we should redirect to dashboard (only on the login page)
  const checkForDashboardRedirect = useCallback(() => {
    if (location.pathname === '/secretadminportal' && 
        !redirectAttempted && 
        (isAuthenticated || user?.isAdmin)) {
      setRedirectAttempted(true);
      redirectToDashboardIfAdmin();
    }
  }, [location.pathname, redirectAttempted, isAuthenticated, user?.isAdmin, redirectToDashboardIfAdmin]);
  
  // Reset redirect flag when path changes
  if (location.pathname !== '/secretadminportal' && redirectAttempted) {
    setRedirectAttempted(false);
  }
  
  return {
    isAuthenticated: isAuthenticated || Boolean(user?.isAdmin),
    isLoading,
    user,
    refreshSession,
    checkForDashboardRedirect
  };
};

export default useAdminSession;
