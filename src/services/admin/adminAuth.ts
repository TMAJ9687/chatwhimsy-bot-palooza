
import { supabase } from '@/integrations/supabase/client';

/**
 * Admin login
 */
export const adminLogin = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Admin login error:', error.message);
      return false;
    }
    
    if (data.user) {
      // Store admin email for checking admin status
      localStorage.setItem('adminEmail', email);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in adminLogin:', error);
    return false;
  }
};

/**
 * Admin logout
 */
export const adminLogout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Admin logout error:', error.message);
    }
    
    // Clean up admin data
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminData');
  } catch (error) {
    console.error('Error in adminLogout:', error);
  }
};

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    // Check if stored admin email matches session email
    return localStorage.getItem('adminEmail') === session.user.email;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
