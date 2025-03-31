
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { onAuthStateChange, isUserAdmin } from '@/firebase/auth';
import AdminAuthService from '@/services/admin/adminAuthService';

/**
 * Hook to manage admin user state
 */
export const useAdminUser = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const authListenerSetRef = useRef(false);
  
  // Setup firebase auth listener
  useEffect(() => {
    console.log('Setting up admin user auth listener');
    
    if (authListenerSetRef.current) {
      console.log('Auth listener already set up, skipping');
      return;
    }
    
    authListenerSetRef.current = true;
    
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? 'logged in' : 'logged out');
      
      if (firebaseUser) {
        const admin = isUserAdmin(firebaseUser);
        console.log('User is admin:', admin);
        
        if (admin) {
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
        }
      } else if (AdminAuthService.isAdminSession()) {
        // If Firebase user is logged out but we have admin session active,
        // reconstruct admin user profile
        console.log('No Firebase user, checking admin session fallback');
        
        if (!user?.isAdmin) {
          setUser({
            id: 'admin-user',
            nickname: 'Admin',
            email: 'admin@example.com',
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
      }
      
      setIsLoading(false);
    });
    
    return () => {
      console.log('Cleaning up admin user auth listener');
      unsubscribe();
      authListenerSetRef.current = false;
    };
  }, [setUser]);
  
  // Function to redirect to dashboard if admin is authenticated
  const redirectToDashboardIfAdmin = useCallback(() => {
    if (user?.isAdmin || AdminAuthService.isAdminSession()) {
      navigate('/admin-dashboard');
    }
  }, [navigate, user?.isAdmin]);

  return {
    isLoading,
    user,
    redirectToDashboardIfAdmin
  };
};

export default useAdminUser;
