
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as adminService from '@/services/admin/supabaseAdminAuth';

/**
 * Custom hook for admin authentication logic
 */
export const useAdminAuth = () => {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  
  // Computed properties
  const isAdmin = useMemo(() => {
    return !!adminData || (user?.isAdmin === true);
  }, [user, adminData]);
  
  // Listen for Supabase auth state changes
  useEffect(() => {
    let mounted = true;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (!mounted) return;
      
      setAuthUser(session?.user || null);
      
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          try {
            const { data, error } = await supabase.rpc('get_admin_user', {
              p_user_id: session.user.id
            });
            
            if (error) {
              console.error('Error checking admin status:', error);
            } else if (data) {
              setAdminData(data);
              
              // Update last login
              await supabase.rpc('update_admin_last_login', {
                p_user_id: session.user.id
              });
                
              // Update user context if needed
              if (!user?.isAdmin) {
                setUser(prevUser => ({
                  ...(prevUser || {
                    id: 'admin-user',
                    nickname: 'Admin',
                    email: session.user.email || 'admin@example.com',
                    gender: 'male',
                    age: 30,
                    country: 'US',
                    interests: ['Administration'],
                    isVip: true,
                    subscriptionTier: 'none',
                    imagesRemaining: Infinity,
                    voiceMessagesRemaining: Infinity
                  }),
                  isAdmin: true,
                  email: session.user.email || prevUser?.email || 'admin@example.com'
                }));
              }
            }
          } catch (error) {
            console.error('Error fetching admin data:', error);
          } finally {
            setLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setAdminData(null);
        setLoading(false);
      }
    });
    
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setAuthUser(session.user);
          
          const { data, error } = await supabase.rpc('get_admin_user', {
            p_user_id: session.user.id
          });
          
          if (error) {
            console.error('Error checking admin status:', error);
          } else if (data) {
            setAdminData(data);
            
            // Update user context if needed
            if (!user?.isAdmin) {
              setUser(prevUser => ({
                ...(prevUser || {
                  id: 'admin-user',
                  nickname: 'Admin',
                  email: session.user.email || 'admin@example.com',
                  gender: 'male',
                  age: 30,
                  country: 'US',
                  interests: ['Administration'],
                  isVip: true,
                  subscriptionTier: 'none',
                  imagesRemaining: Infinity,
                  voiceMessagesRemaining: Infinity
                }),
                isAdmin: true,
                email: session.user.email || prevUser?.email || 'admin@example.com'
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, user]);
  
  // Admin logout
  const adminLogout = useCallback(async () => {
    try {
      await adminService.adminLogout();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out of the admin panel',
      });
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);
  
  // Admin settings
  const changeAdminPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        console.error('Error changing password:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to change password',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);
  
  return {
    isAdmin,
    adminData,
    authUser,
    loading,
    adminLogout,
    changeAdminPassword
  };
};
