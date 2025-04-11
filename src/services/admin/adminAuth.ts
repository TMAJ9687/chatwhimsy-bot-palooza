
import { supabase } from '@/integrations/supabase/client';

/**
 * Admin login
 */
export const adminLogin = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Attempting admin login for:', email);
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
      
      console.log('Admin login successful');
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
    console.log('Executing admin logout...');
    
    // Clean up admin data first
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminData');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Admin logout error:', error.message);
    } else {
      console.log('Admin logout successful');
    }
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
    const adminEmail = localStorage.getItem('adminEmail');
    
    // Simplified approach: if we have adminEmail in localStorage and a session, consider admin logged in
    if (session?.user && adminEmail && session.user.email === adminEmail) {
      return true;
    }
    
    // No valid admin session
    if (!session?.user || !adminEmail) {
      // Clean up any leftover admin data
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminData');
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
