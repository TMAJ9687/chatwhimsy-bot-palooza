
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { isAdminLoggedIn } from '@/services/admin/adminService';

/**
 * Hook to manage admin session persistence and protection
 * @param redirectPath Path to redirect to if not authenticated
 * @returns Object containing admin session state
 */
export const useAdminSession = (redirectPath: string = '/admin-login') => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
  // Check admin authentication on mount and when user changes
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminLoggedIn = isAdminLoggedIn();
      
      // If not logged in as admin, redirect
      if (!adminLoggedIn) {
        navigate(redirectPath);
        return;
      }
      
      // If admin is logged in but we don't have user data (e.g., after page refresh),
      // reconstruct the admin user from localStorage
      if (adminLoggedIn && !user?.isAdmin) {
        const adminEmail = localStorage.getItem('adminEmail') || 'admin@example.com';
        
        setUser({
          id: 'admin-user',
          nickname: 'Admin',
          email: adminEmail,
          gender: 'male',
          age: 30,
          country: 'US',
          interests: ['Administration'],
          isVip: true,
          isAdmin: true,
          subscriptionTier: 'none',
          imagesRemaining: Infinity,
          voiceMessagesRemaining: Infinity
        });
      }
    };
    
    checkAdminAuth();
    
    // Set up interval to periodically check admin session
    const intervalId = setInterval(checkAdminAuth, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [navigate, redirectPath, user, setUser]);
  
  return {
    isAuthenticated: Boolean(user?.isAdmin) || isAdminLoggedIn(),
    user,
  };
};

export default useAdminSession;
