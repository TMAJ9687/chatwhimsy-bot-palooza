
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';

/**
 * Hook to manage Supabase authentication state
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Set initial loading state
    setLoading(true);
    
    let mounted = true;
    
    // First set up the auth state listener to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Supabase auth state changed:', event);
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        
        // We're initialized after the first auth state change
        if (!initialized) setInitialized(true);
        setLoading(false);
      }
    );
    
    // Then check for existing session - safely
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        
        // If we've waited too long for the auth state change, mark as initialized
        if (!initialized) setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        
        if (!mounted) return;
        
        // Even on error, we need to finish loading
        if (!initialized) setInitialized(true);
        setLoading(false);
      }
    };
    
    getInitialSession();
    
    // Cleanup subscription
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  return {
    user,
    session,
    loading,
    signIn: supabase.auth.signInWithPassword,
    signUp: supabase.auth.signUp,
    signOut: supabase.auth.signOut,
    resetPassword: supabase.auth.resetPasswordForEmail,
  };
};

export default useSupabaseAuth;
