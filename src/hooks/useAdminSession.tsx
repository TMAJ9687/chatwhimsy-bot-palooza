
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChange, isUserAdmin } from '@/firebase/auth';

/**
 * Hook to manage admin session persistence and protection
 * @param redirectPath Path to redirect to if not authenticated
 * @returns Object containing admin session state
 */
export const useAdminSession = (redirectPath: string = '/secretadminportal') => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check admin authentication on mount and when user changes
  const checkAdminAuth = useCallback(() => {
    console.log('Checking admin authentication status...');
    console.log('Current path:', location.pathname);
    const adminLoggedIn = isAdminLoggedIn();
    console.log('Admin logged in (service):', adminLoggedIn);
    console.log('Admin logged in (context):', Boolean(user?.isAdmin));
    
    setIsAuthenticated(adminLoggedIn || Boolean(user?.isAdmin));
    
    // If we're already on the admin login page, don't redirect
    if (location.pathname === '/secretadminportal') {
      console.log('Already on admin login page, not redirecting');
      setIsLoading(false);
      return;
    }
    
    // If logged in and on admin login page, redirect to dashboard
    if ((adminLoggedIn || user?.isAdmin) && location.pathname === '/secretadminportal') {
      console.log('Admin is authenticated, redirecting to dashboard');
      setIsLoading(false);
      navigate('/admin-dashboard');
      return;
    }
    
    // If not logged in as admin and not on the login page, redirect to login
    if (!adminLoggedIn && !user?.isAdmin && !location.pathname.includes('/secretadminportal')) {
      console.log('Not authenticated as admin, redirecting to:', redirectPath);
      setIsLoading(false);
      
      // Clear any stale admin data
      localStorage.removeItem('adminEmail');
      
      navigate(redirectPath);
      return;
    }
    
    // If admin is logged in but we don't have user data (e.g., after page refresh),
    // reconstruct the admin user from localStorage
    if (adminLoggedIn && !user?.isAdmin) {
      console.log('Admin is logged in but user context missing, reconstructing from localStorage');
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
    console.log('Admin authentication check complete');
  }, [navigate, redirectPath, user, setUser, location.pathname]);
  
  useEffect(() => {
    console.log('useAdminSession hook initialized');
    
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? 'logged in' : 'logged out');
      
      if (firebaseUser) {
        const admin = isUserAdmin(firebaseUser);
        console.log('User is admin:', admin);
        
        if (admin) {
          setIsAuthenticated(true);
          
          // Create admin user profile if not already set
          if (!user?.isAdmin) {
            console.log('Setting up admin user in context');
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
          
          // If on admin login page, redirect to dashboard
          if (location.pathname === '/secretadminportal') {
            console.log('Admin authenticated, redirecting to dashboard');
            navigate('/admin-dashboard');
          }
        } else {
          console.log('Firebase user is not an admin');
          setIsAuthenticated(false);
        }
      } else {
        console.log('No Firebase user, checking localStorage fallback');
        // No user signed in, check localStorage fallback
        checkAdminAuth();
      }
      
      setIsLoading(false);
    });
    
    // Set up interval to periodically check admin session
    const intervalId = setInterval(() => {
      console.log('Periodic admin session check');
      checkAdminAuth();
    }, 60000); // Check every minute
    
    return () => {
      console.log('Cleaning up useAdminSession hook');
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [checkAdminAuth, user, setUser, location.pathname, navigate]);
  
  return {
    isAuthenticated,
    isLoading,
    user,
    refreshSession: checkAdminAuth
  };
};

export default useAdminSession;
