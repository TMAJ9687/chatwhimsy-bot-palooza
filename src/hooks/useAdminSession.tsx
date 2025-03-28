
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChange, isUserAdmin } from '@/firebase/auth';

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Check admin authentication on mount and when user changes
  const checkAdminAuth = useCallback(() => {
    const adminLoggedIn = isAdminLoggedIn();
    setIsAuthenticated(adminLoggedIn || Boolean(user?.isAdmin));
    
    // If not logged in as admin, redirect
    if (!adminLoggedIn && !user?.isAdmin) {
      setIsLoading(false);
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
    
    setIsLoading(false);
  }, [navigate, redirectPath, user, setUser]);
  
  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const admin = isUserAdmin(firebaseUser);
        
        if (admin) {
          setIsAuthenticated(true);
          
          // Create admin user profile if not already set
          if (!user?.isAdmin) {
            setUser({
              id: firebaseUser.uid || 'admin-user',
              nickname: 'Admin',
              email: firebaseUser.email || 'admin@example.com',
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
        } else {
          setIsAuthenticated(false);
        }
      } else {
        // No user signed in, check localStorage fallback
        checkAdminAuth();
      }
      
      setIsLoading(false);
    });
    
    // Set up interval to periodically check admin session
    const intervalId = setInterval(() => {
      checkAdminAuth();
    }, 60000); // Check every minute
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [checkAdminAuth, user, setUser]);
  
  return {
    isAuthenticated,
    isLoading,
    user,
    refreshSession: checkAdminAuth
  };
};

export default useAdminSession;
