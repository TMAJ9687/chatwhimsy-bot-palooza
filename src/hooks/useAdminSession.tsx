
import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as adminService from '@/services/admin/supabaseAdminAuth';

/**
 * Hook to manage admin session persistence and protection
 * @param redirectPath Path to redirect to if not authenticated
 * @returns Object containing admin session state
 */
export const useAdminSession = (redirectPath: string = '/secretadminportal') => {
  const location = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  
  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Checking admin auth status...');
      const authenticated = await adminService.isAdminLoggedIn();
      console.log('Admin authenticated:', authenticated);
      
      if (authenticated) {
        // If authenticated, get the current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          try {
            // Get admin user details
            const { data, error } = await supabase
              .from('admin_users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.warn('Error fetching admin user details:', error.message);
            } else if (data) {
              setAdminUser(data);
              console.log('Admin user details fetched:', data);
            } else {
              // Fallback to session user if no admin record found
              setAdminUser({ email: session.user.email, id: session.user.id });
              console.log('Using fallback admin details');
            }
          } catch (error) {
            console.error('Error in admin user fetch:', error);
            // Use session user as fallback
            setAdminUser({ email: session.user.email, id: session.user.id });
          }
        }
      }
      
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      toast({
        title: 'Authentication Error',
        description: 'Failed to check admin status',
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  // Setup auth state listener
  useEffect(() => {
    // Prevent multiple listeners
    let isMounted = true;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      console.log('Admin auth state changed:', event);
      
      if (event === 'SIGNED_IN') {
        // Don't set authenticated yet - need to check if user is admin
        if (isMounted) {
          checkAuthStatus();
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setIsAuthenticated(false);
          setAdminUser(null);
        }
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAuthStatus]);
  
  // Initial auth check
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (isMounted) {
        await checkAuthStatus();
      }
    };
    
    checkAuth();
    
    // Set up interval to periodically check admin session
    const intervalId = setInterval(() => {
      if (isMounted) {
        console.log('Periodic admin session check');
        checkAuthStatus();
      }
    }, 60000); // Check every minute
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [checkAuthStatus]);
  
  // Handle redirect to dashboard if admin is authenticated
  const checkForDashboardRedirect = useCallback(() => {
    if (location.pathname === '/secretadminportal' && 
        !redirectAttempted && 
        isAuthenticated) {
      setRedirectAttempted(true);
      return '/admin-dashboard';
    }
    return null;
  }, [location.pathname, redirectAttempted, isAuthenticated]);
  
  // Reset redirect flag when path changes
  useEffect(() => {
    if (location.pathname !== '/secretadminportal' && redirectAttempted) {
      setRedirectAttempted(false);
    }
  }, [location.pathname, redirectAttempted]);

  return {
    isAuthenticated,
    isLoading,
    user: adminUser || user,
    refreshSession: checkAuthStatus,
    checkForDashboardRedirect
  };
};

export default useAdminSession;
