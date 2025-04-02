
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage admin user state
 */
export const useAdminUser = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Setup supabase auth listener
  useEffect(() => {
    console.log('Setting up admin user auth listener');
    
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', session ? 'logged in' : 'logged out');
      
      if (session?.user) {
        // Check if user is admin - in a real app this would check a claim or query a role
        const isUserAdmin = async () => {
          try {
            // You would typically call a Supabase function like this:
            // const { data, error } = await supabase.rpc('is_admin', { user_id: session.user.id })
            // For now, simulate with localStorage
            return localStorage.getItem('adminEmail') === session.user.email;
          } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
          }
        };
        
        isUserAdmin().then(admin => {
          console.log('User is admin:', admin);
          
          if (admin) {
            // Create admin user profile if not already set
            if (!user?.isAdmin) {
              console.log('Setting up admin user in context');
              setUser({
                id: session.user.id || 'admin-user',
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
        });
      } else if (localStorage.getItem('adminData')) {
        // If Supabase user is logged out but we have adminData in localStorage,
        // reconstruct admin user from localStorage
        console.log('No Supabase user, checking localStorage fallback');
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
      subscription.unsubscribe();
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
