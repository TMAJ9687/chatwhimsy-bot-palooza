
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = async (): Promise<boolean> => {
  try {
    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // First, check if the user exists in the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.log('Error checking admin status:', error.message);
      
      // As a fallback, check if email matches localStorage admin email
      // This is for backward compatibility
      if (localStorage.getItem('adminEmail') === session.user.email) {
        console.log('Admin verified via localStorage fallback');
        return true;
      }
      
      return false;
    }
    
    if (data) {
      console.log('Admin verified via database');
      // Store admin email in localStorage for fallback
      localStorage.setItem('adminEmail', data.email || session.user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

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
      // Check if this user is actually in the admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('id', data.user.id)
        .single();
      
      if (adminError || !adminData) {
        console.error('User exists but is not an admin:', adminError?.message || 'Not found in admin_users');
        return false;
      }
      
      // Store admin email in localStorage for fallback and for session persistence
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ email, id: data.user.id }));
      
      console.log('Admin login successful');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Admin login error:', error);
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
    
    // Clean up localStorage
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminData');
  } catch (error) {
    console.error('Admin logout error:', error);
  }
};
