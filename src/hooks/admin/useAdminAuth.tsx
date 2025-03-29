
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChange, isUserAdmin } from '@/firebase/auth';
import * as adminService from '@/services/admin/adminService';

/**
 * Custom hook for admin authentication logic
 */
export const useAdminAuth = () => {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  
  // Computed properties
  const isAdmin = useMemo(() => {
    // Check both React state and Firebase auth
    return (user?.isAdmin === true) || (firebaseUser && isUserAdmin(firebaseUser));
  }, [user, firebaseUser]);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((fbUser) => {
      setFirebaseUser(fbUser);
      
      // If Firebase user is admin but user context doesn't have admin flag
      if (fbUser && isUserAdmin(fbUser) && (!user || !user.isAdmin)) {
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
    });
    
    return () => {
      unsubscribe();
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
