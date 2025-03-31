
// This file now redirects all Firebase auth operations to Supabase
import { supabase } from '../lib/supabase/supabaseClient';
import { firebaseAuthToSupabase } from '../lib/compatibility/firebaseToSupabase';
import { performDOMCleanup } from '@/utils/errorHandler';

// Sign in with email and password - redirects to Supabase
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting Supabase sign in:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log('Supabase sign in successful, user:', data.user?.email);
    
    if (isUserAdmin(data.user)) {
      console.log('Admin user logged in, storing session data');
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
    }
    
    return data.user;
  } catch (error: any) {
    console.error("Supabase signIn error:", error.message);
    throw error;
  }
};

// Create a new user with email and password
export const createUserWithEmail = async (email: string, password: string) => {
  console.log('Creating new user with email:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  
  console.log('User created successfully:', data.user?.email);
  return data.user;
};

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  console.log('Sending password reset email to:', email);
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) throw error;
  
  console.log('Password reset email sent successfully');
};

// Enhanced sign out with better cleanup
export const signOutUser = async () => {
  try {
    console.log('Supabase signOut started');
    
    // Set logout event to enable cross-tab coordination
    localStorage.setItem('logoutEvent', Date.now().toString());
    
    // Clean up any UI elements that might cause issues during navigation
    performDOMCleanup();
    
    // Clear admin-specific data first
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminEmail');
    
    // Systematic data cleanup before Supabase signout
    localStorage.removeItem('chatUser');
    localStorage.removeItem('vipProfileComplete');
    sessionStorage.clear();
    
    // Now perform the actual signOut operation
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    console.log('Supabase signOut completed successfully');
  } catch (error) {
    console.error('Supabase signOut error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  // This function remains synchronous for compatibility, 
  // but uses the stored Supabase session
  try {
    const session = JSON.parse(localStorage.getItem('sb-' + process.env.SUPABASE_PROJECT_ID + '-auth-token') || '{}');
    return session?.user || null;
  } catch (e) {
    console.error('Error getting current user from Supabase session:', e);
    return null;
  }
};

// Check if user is admin
export const isUserAdmin = (user: any): boolean => {
  if (!user) {
    console.log('No user provided for admin check');
    return false;
  }
  
  // For demo purposes, consider these emails as admin
  const adminEmails = ['admin@example.com', 'your-email@example.com', 'user@example.com'];
  const isAdmin = adminEmails.includes(user.email || '');
  console.log('Admin check for', user.email, ':', isAdmin);
  return isAdmin;
};

// Listen to auth state changes
export const onAuthStateChange = firebaseAuthToSupabase.onAuthStateChanged;

// For demo purposes - this simulates verifying admin credentials
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Verifying admin credentials');
    // This will throw if credentials are invalid
    const user = await signInWithEmail(email, password);
    
    // Check if email is in the admin list
    const isAdmin = isUserAdmin(user);
    
    return isAdmin;
  } catch (error) {
    console.error('Authentication error:', error);
    
    // For demo - allow a hardcoded admin login
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Using hardcoded admin credentials');
      return true;
    }
    
    return false;
  }
};
