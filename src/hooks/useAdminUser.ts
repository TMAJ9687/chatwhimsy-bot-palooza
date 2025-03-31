
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import AdminAuthService from '@/services/admin/adminAuthService';
import { supabase } from '@/lib/supabase/supabaseClient';

/**
 * Hook to manage admin user state
 */
export const useAdminUser = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const authListenerSetRef = useRef(false);
  
  // Setup auth listener
  useEffect(() => {
    console.log('Setting up admin user auth listener');
    
    if (authListenerSetRef.current) {
      console.log('Auth listener already set up, skipping');
      return;
    }
    
    authListenerSetRef.current = true;
    
    // Check if admin session exists
    if (AdminAuthService.isAdminSession()) {
      console.log('Admin session found, creating admin user profile');
      
      if (!user?.isAdmin) {
        // Create admin user profile if not already set
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
    
    // Set up Supabase auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth state changed:', event);
      
      if (session?.user) {
        // If authenticated, check if user is admin
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        const isAdmin = Boolean(profileData?.is_admin);
        
        if (isAdmin) {
          console.log('User is admin:', isAdmin);
          
          if (!user?.isAdmin) {
            console.log('Setting up admin user in context');
            setUser({
              id: session.user.id,
              nickname: 'Admin',
              email: session.user.email || 'admin@example.com',
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
      }
      
      setIsLoading(false);
    });
    
    return () => {
      console.log('Cleaning up admin user auth listener');
      authListener.subscription.unsubscribe();
      authListenerSetRef.current = false;
    };
  }, [setUser, user]);
  
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
