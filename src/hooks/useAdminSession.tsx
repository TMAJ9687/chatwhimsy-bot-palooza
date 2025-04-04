
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
  const [error, setError] = useState<Error | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  // Check authentication status with retries and better error handling
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Checking admin auth status...');
      
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, admin not authenticated');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Try localStorage fallback first if we're having issues
      if (failedAttempts > 2) {
        console.log('Using localStorage fallback after multiple failed attempts');
        const adminEmail = localStorage.getItem('adminEmail');
        if (adminEmail === session.user.email) {
          console.log('Admin verified via localStorage fallback');
          // Construct basic admin user from session
          const adminInfo = { 
            email: session.user.email, 
            id: session.user.id 
          };
          setAdminUser(adminInfo);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Use the is_admin RPC function to check admin status
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc(
          'is_admin',
          { user_id: session.user.id }
        );
        
        if (rpcError) {
          console.error('Error checking admin status with RPC:', rpcError.message);
          throw rpcError;
        }
        
        if (isAdmin) {
          console.log('Admin verified via secure RPC function');
          
          try {
            const adminDataString = localStorage.getItem('adminData');
            if (adminDataString) {
              const adminData = JSON.parse(adminDataString);
              setAdminUser(adminData);
            } else {
              setAdminUser({ 
                email: session.user.email, 
                id: session.user.id 
              });
            }
          } catch (e) {
            console.warn('Error parsing admin data from localStorage:', e);
            setAdminUser({ 
              email: session.user.email, 
              id: session.user.id 
            });
          }
          
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } catch (rpcError) {
        console.error('Failed to check admin status with RPC, trying fallback method:', rpcError);
        // Continue to fallback
      }
      
      // Fallback: direct admin_users table check
      try {
        // Use the admin_users table directly
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, email')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.log('Error checking admin status via direct query:', error.message);
          throw error;
        }
        
        if (data) {
          console.log('Admin verified via database fallback');
          
          // Store data for future fallback
          localStorage.setItem('adminEmail', data.email || session.user.email);
          localStorage.setItem('adminData', JSON.stringify({ 
            email: data.email || session.user.email, 
            id: session.user.id 
          }));
          
          setAdminUser(data);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } catch (dbError) {
        console.error('Database fallback check failed:', dbError);
        // Continue to last resort check
      }
      
      // Last resort: check localStorage fallback
      const adminEmail = localStorage.getItem('adminEmail');
      if (adminEmail === session.user.email) {
        console.log('Admin verified via localStorage final fallback');
        setAdminUser({ 
          email: session.user.email, 
          id: session.user.id 
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      
      // If we got here, user is not admin
      console.log('User is not an admin after all checks');
      setIsAuthenticated(false);
      setAdminUser(null);
      setIsLoading(false);
      
      // Increment failed attempts for future reference
      setFailedAttempts(prev => prev + 1);
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError(error as Error);
      setIsAuthenticated(false);
      setIsLoading(false);
      setFailedAttempts(prev => prev + 1);
      
      // Only show toast if really needed
      if (failedAttempts < 2) {
        toast({
          title: 'Authentication Check Failed',
          description: 'There was an issue verifying your admin status. Retrying...',
          variant: 'destructive',
        });
      }
    }
  }, [toast, failedAttempts]);
  
  // Setup auth state listener with better error handling
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
          // Add slight delay to avoid race conditions
          setTimeout(() => {
            checkAuthStatus();
          }, 100);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setIsAuthenticated(false);
          setAdminUser(null);
          setIsLoading(false);
        }
      }
    });
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAuthStatus]);
  
  // Initial auth check with retry logic
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const checkAuth = async () => {
      if (isMounted) {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error(`Auth check failed (attempt ${retryCount + 1}):`, error);
          
          // Retry logic
          if (retryCount < maxRetries && isMounted) {
            retryCount++;
            console.log(`Retrying auth check in ${retryCount * 1000}ms...`);
            
            setTimeout(checkAuth, retryCount * 1000);
          } else if (isMounted) {
            // Max retries reached
            setIsLoading(false);
            setError(new Error('Failed to verify admin status after multiple attempts'));
            
            toast({
              title: 'Authentication Failed',
              description: 'Could not verify your admin status. Please try again later.',
              variant: 'destructive',
            });
          }
        }
      }
    };
    
    checkAuth();
    
    // Set up interval to periodically check admin session
    // Use a more reasonable interval - 2 minutes
    const intervalId = setInterval(() => {
      if (isMounted) {
        console.log('Periodic admin session check');
        checkAuthStatus();
      }
    }, 120000); // Check every 2 minutes
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [checkAuthStatus, toast]);
  
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
    error,
    refreshSession: checkAuthStatus,
    checkForDashboardRedirect,
    failedAttempts
  };
};

export default useAdminSession;
