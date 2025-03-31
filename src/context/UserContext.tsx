
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { UserProfile, UserContextType, SubscriptionTier } from '@/types/user';
import { useVipSubscription } from '@/hooks/useVipSubscription';
import useLogoutSync from '@/hooks/useLogoutSync';
import { 
  getVipUserProfile, 
  getTemporaryUserByToken,
  updateUserProfile as updateSupabaseProfile
} from '@/lib/supabase/supabaseProfile';
import { getCurrentUser } from '@/lib/supabase/supabaseAuth';
import { getStoredToken } from '@/utils/tokenUtils';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Load user data from Supabase or localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (initialLoadComplete) return;
      
      try {
        // First check for auth user from Supabase
        const authUser = await getCurrentUser();
        
        if (authUser) {
          // We have an authenticated user, get their profile
          const profile = await getVipUserProfile(authUser.id);
          
          if (profile) {
            console.log('Loaded auth user profile from Supabase:', profile.nickname);
            setUser(profile);
            
            // Set profile complete flag if applicable
            if (profile.gender && profile.age && profile.country && profile.isVip) {
              localStorage.setItem('vipProfileComplete', 'true');
            }
          } else {
            console.log('Auth user has no profile yet');
            // Create a basic profile if none exists
            const basicProfile: UserProfile = {
              id: authUser.id,
              nickname: authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              gender: 'male',
              age: 25,
              country: 'US',
              interests: [],
              isVip: true,
              subscriptionTier: 'monthly',
              imagesRemaining: 100,
              voiceMessagesRemaining: 50
            };
            setUser(basicProfile);
            // Save this basic profile
            updateSupabaseProfile(basicProfile).catch(e => {
              console.warn('Error creating basic profile:', e);
            });
          }
        } else {
          // Check for temporary user via token
          const token = getStoredToken();
          
          if (token) {
            const tempProfile = await getTemporaryUserByToken(token);
            
            if (tempProfile) {
              console.log('Loaded temporary user profile:', tempProfile.nickname);
              setUser(tempProfile);
            } else {
              console.log('Invalid or expired temporary user token');
              // Fall back to localStorage
              const storedUser = localStorage.getItem('chatUser');
              
              if (storedUser) {
                try {
                  const parsedUser = JSON.parse(storedUser) as UserProfile;
                  console.log('Loaded user from localStorage:', parsedUser.nickname);
                  setUser(parsedUser);
                } catch (error) {
                  console.error('Error parsing user from localStorage:', error);
                }
              }
            }
          } else {
            // Fall back to localStorage
            const storedUser = localStorage.getItem('chatUser');
            
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser) as UserProfile;
                console.log('Loaded user from localStorage:', parsedUser.nickname);
                setUser(parsedUser);
              } catch (error) {
                console.error('Error parsing user from localStorage:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoadError(error as Error);
      } finally {
        setInitialLoadComplete(true);
      }
    };
    
    loadUserData();
  }, [initialLoadComplete]);

  // Handle logout synchronization across tabs
  useLogoutSync();

  // Enhanced user cleanup function to ensure complete state reset
  const clearUser = useCallback(() => {
    console.log('Clearing user state from context');
    
    // Reset user state
    setUser(null);
    
    // Clear all user-related local storage
    localStorage.removeItem('vipProfileComplete');
    localStorage.removeItem('chatUser');
    localStorage.removeItem('temporaryUserToken');
    sessionStorage.clear();
  }, []);

  // Update profile both in Supabase and locally
  const updateUserProfile = useCallback(async (profileUpdate: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) {
        // Creating a new user
        const newUser = {
          ...profileUpdate,
          id: profileUpdate.id || Math.random().toString(36).substring(2, 15),
          nickname: profileUpdate.nickname || 'User',
          email: profileUpdate.email || '',
          gender: profileUpdate.gender || 'male',
          age: profileUpdate.age || 25,
          country: profileUpdate.country || 'US',
          interests: profileUpdate.interests || [],
          isVip: profileUpdate.isVip === true,
          isAdmin: profileUpdate.isAdmin === true,
          subscriptionTier: profileUpdate.subscriptionTier || 'none',
          imagesRemaining: profileUpdate.imagesRemaining || 15,
          voiceMessagesRemaining: profileUpdate.voiceMessagesRemaining || 0
        } as UserProfile;
        
        // Also update in Supabase (async)
        updateSupabaseProfile(newUser).catch(error => {
          console.error('Error saving new user to Supabase:', error);
        });
        
        // Also update in localStorage as fallback
        localStorage.setItem('chatUser', JSON.stringify(newUser));
        
        return newUser;
      }
      
      const updatedUser = { ...prevUser, ...profileUpdate };
      
      if (updatedUser.isVip === undefined) {
        updatedUser.isVip = Boolean(prevUser.isVip);
      }
      
      const wouldCompleteProfile = Boolean(
        updatedUser.gender && 
        updatedUser.age && 
        updatedUser.country
      );
      
      if (wouldCompleteProfile && updatedUser.isVip) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      // Also update in Supabase (async)
      updateSupabaseProfile(updatedUser).catch(error => {
        console.error('Error updating user in Supabase:', error);
      });
      
      // Also update in localStorage as fallback
      localStorage.setItem('chatUser', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
  }, []);

  const { subscribeToVip, cancelVipSubscription } = useVipSubscription(updateUserProfile);

  // Memoized computed values
  const isProfileComplete = useMemo(() => 
    Boolean(user && user.gender && user.age && user.country),
    [user]
  );

  const isVip = useMemo(() => 
    Boolean(user?.isVip) || Boolean(user?.isAdmin),
    [user]
  );
  
  const isAdmin = useMemo(() => 
    Boolean(user?.isAdmin),
    [user]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    setUser,
    isProfileComplete,
    updateUserProfile,
    clearUser,
    isVip,
    isAdmin,
    subscribeToVip,
    cancelVipSubscription,
    loadError
  }), [
    user, 
    setUser, 
    isProfileComplete, 
    updateUserProfile, 
    clearUser, 
    isVip,
    isAdmin,
    subscribeToVip, 
    cancelVipSubscription,
    loadError
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
