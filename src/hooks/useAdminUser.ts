
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { onAuthStateChange, isUserAdmin } from '@/firebase/auth';

/**
 * Hook to manage admin user state
 */
export const useAdminUser = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Setup firebase auth listener
  useEffect(() => {
    console.log('Setting up admin user auth listener');
    
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
      } else if (localStorage.getItem('adminData')) {
        // If Firebase user is logged out but we have adminData in localStorage,
        // reconstruct admin user from localStorage
        console.log('No Firebase user, checking localStorage fallback');
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
    });
    
    return () => {
      console.log('Cleaning up admin user auth listener');
      unsubscribe();
    };
  }, [setUser, user]);
  
  // Function to redirect to dashboard if admin is authenticated
  const redirectToDashboardIfAdmin = useCallback(() => {
    if (user?.isAdmin) {
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
