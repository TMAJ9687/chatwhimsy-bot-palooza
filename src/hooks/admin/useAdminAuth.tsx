
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChange, isUserAdmin } from '@/firebase/auth';
import * as adminService from '@/services/admin/adminService';
import AdminAuthService from '@/services/admin/adminAuthService';

/**
 * Custom hook for admin authentication logic
 */
export const useAdminAuth = () => {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [adminSessionChecked, setAdminSessionChecked] = useState(false);
  
  // Computed properties
  const isAdmin = useMemo(() => {
    // Check both React state, Firebase auth, and AdminAuthService
    return (user?.isAdmin === true) || 
           (firebaseUser && isUserAdmin(firebaseUser)) || 
           AdminAuthService.isAdminSession();
  }, [user, firebaseUser]);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    let mounted = true;
    
    // Check admin session first (synchronous)
    if (!adminSessionChecked) {
      const adminSession = AdminAuthService.isAdminSession();
      setAdminSessionChecked(true);
      
      // If admin session exists, update user context
      if (adminSession && !user?.isAdmin) {
        // Using setTimeout to avoid React state update conflicts
        setTimeout(() => {
          if (mounted) {
            setUser(prevUser => {
              if (!prevUser) {
                return {
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
                };
              }
              // Only update isAdmin if not already set
              if (!prevUser.isAdmin) {
                return { ...prevUser, isAdmin: true };
              }
              return prevUser;
            });
          }
        }, 0);
      }
    }
    
    // Then set up Firebase auth listener
    const unsubscribe = onAuthStateChange((fbUser) => {
      if (!mounted) return;
      
      setFirebaseUser(fbUser);
      
      // If Firebase user is admin but user context doesn't have admin flag
      if (fbUser && isUserAdmin(fbUser) && (!user || !user.isAdmin)) {
        // Using setTimeout to avoid React state update conflicts
        setTimeout(() => {
          if (mounted) {
            // Update user context with admin status
            setUser(prevUser => {
              if (!prevUser) {
                // Create new user if none exists
                return {
                  id: 'admin-user',
                  nickname: 'Admin',
                  email: fbUser.email || 'admin@example.com',
                  gender: 'male',
                  age: 30,
                  country: 'US',
                  interests: ['Administration'],
                  isVip: true,
                  isAdmin: true,
                  subscriptionTier: 'none',
                  imagesRemaining: Infinity,
                  voiceMessagesRemaining: Infinity
                };
              }
              
              // Update existing user
              return {
                ...prevUser,
                isAdmin: true,
                email: fbUser.email || prevUser.email
              };
            });
          }
        }, 0);
      }
    });
    
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setUser, user, adminSessionChecked]);
  
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
  const changeAdminPassword = useCallback((currentPassword: string, newPassword: string) => {
    // In a real app, this would call an API to change the password
    // For this demo, just simulate success if current password matches hardcoded value
    if (currentPassword !== 'admin123') {
      toast({
        title: 'Error',
        description: 'Current password is incorrect',
        variant: 'destructive',
      });
      return false;
    }
    
    toast({
      title: 'Success',
      description: 'Password changed successfully',
    });
    return true;
  }, [toast]);
  
  return {
    isAdmin,
    firebaseUser,
    adminLogout,
    changeAdminPassword
  };
};
