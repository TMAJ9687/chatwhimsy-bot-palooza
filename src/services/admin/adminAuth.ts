
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
      // Store admin email for simplified checking
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ 
        email,
        id: data.user.id
      }));
      
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
    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Simplified approach: if we have adminEmail in localStorage and a session, consider admin logged in
    if (session?.user && localStorage.getItem('adminEmail') === session.user.email) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
