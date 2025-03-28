
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to manage admin session persistence and protection
 * @param redirectPath Path to redirect to if not authenticated
 * @returns Object containing admin session state
 */
export const useAdminSession = (redirectPath: string = '/admin-login') => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check admin authentication on mount and when user changes
  const checkAdminAuth = useCallback(() => {
    const adminLoggedIn = isAdminLoggedIn();
    setIsAuthenticated(adminLoggedIn || Boolean(user?.isAdmin));
    
    // If not logged in as admin, redirect
    if (!adminLoggedIn && !user?.isAdmin) {
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
  }, [navigate, redirectPath, user, setUser]);
  
  useEffect(() => {
    checkAdminAuth();
    
    // Set up interval to periodically check admin session
    const intervalId = setInterval(() => {
      checkAdminAuth();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [checkAdminAuth]);
  
  return {
    isAuthenticated,
    user,
    refreshSession: checkAdminAuth
  };
};

export default useAdminSession;
