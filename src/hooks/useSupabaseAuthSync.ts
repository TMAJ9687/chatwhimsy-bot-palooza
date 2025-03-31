
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useUser } from '@/context/UserContext';
import { getVipUserProfile } from '@/lib/supabase/supabaseProfile';

/**
 * Hook to synchronize Supabase auth state with UserContext
 * This ensures we don't have "Auth session missing" errors
 */
export const useSupabaseAuthSync = () => {
  const { setUser, clearUser, updateUserProfile } = useUser();
  const authListenerRef = useRef<{unsubscribe: () => void} | null>(null);
  const initialCheckDoneRef = useRef(false);

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await getVipUserProfile(userId);
      if (profile) {
        updateUserProfile(profile);
        localStorage.setItem('vipProfileComplete', 'true');
        return true;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    return false;
  }, [updateUserProfile]);

  useEffect(() => {
    // Clean up any existing subscription
    if (authListenerRef.current) {
      authListenerRef.current.unsubscribe();
    }

    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth event:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        const success = await loadUserProfile(session.user.id);
        if (!success) {
          // If profile loading fails, at least update the basic user data
          updateUserProfile({
            id: session.user.id,
            email: session.user.email || '',
            nickname: session.user.email?.split('@')[0] || 'User',
            isVip: true
          });
        }
      } else if (event === 'SIGNED_OUT') {
        clearUser();
        localStorage.removeItem('vipProfileComplete');
      }
    });

    authListenerRef.current = data.subscription;

    // Initial session check (only once)
    if (!initialCheckDoneRef.current) {
      initialCheckDoneRef.current = true;
      
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          console.log('Initial session found, loading profile');
          await loadUserProfile(session.user.id);
        }
      });
    }

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
      }
    };
  }, [loadUserProfile, updateUserProfile, clearUser]);

  return null;
};

export default useSupabaseAuthSync;
