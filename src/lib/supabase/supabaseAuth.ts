
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data.user;
  } catch (error: any) {
    console.error("Supabase signIn error:", error.message);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data.user;
  } catch (error: any) {
    console.error("Supabase signUp error:", error.message);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any local user data
    localStorage.removeItem('chatUser');
    localStorage.removeItem('vipProfileComplete');
    
    return true;
  } catch (error: any) {
    console.error("Supabase signOut error:", error.message);
    return false;
  }
};

/**
 * Get current authenticated user with improved error handling
 * This is now a safe implementation that won't throw errors
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('Auth getUser error (expected if not authenticated):', error.message);
      return null;
    }
    return data.user;
  } catch (e) {
    console.error('Error in getCurrentUser:', e);
    return null;
  }
};

/**
 * Listen to auth changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    // Only update on meaningful auth events
    if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
      callback(session?.user || null);
    }
  });
};

/**
 * Reset password for user
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Password reset error:", error.message);
    return false;
  }
};
