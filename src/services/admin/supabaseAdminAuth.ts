
import { supabase } from '@/integrations/supabase/client';
import { AdminAction } from '@/types/admin';
import { AdminUser } from '@/integrations/supabase/adminTypes';

/**
 * Set admin login status in local storage
 */
export const setAdminLoggedIn = (isLoggedIn: boolean): void => {
  console.log('Setting admin logged in state:', isLoggedIn);
  
  // Store admin authentication state
  if (isLoggedIn) {
    localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
  } else {
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminEmail');
  }
};

/**
 * Verify if admin is currently logged in
 */
export const isAdminLoggedIn = async (): Promise<boolean> => {
  // Check if on admin login page to prevent redirect loops
  if (window.location.pathname === '/secretadminportal') {
    return false;
  }
  
  try {
    // Check Supabase auth state
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    // Check if user is in admin_users table using raw query
    const { data, error } = await supabase.rpc('is_admin', { user_id: session.user.id });
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    const isAdmin = data === true;
    console.log('User is admin:', isAdmin);
    
    // Update localStorage for compatibility
    if (isAdmin) {
      localStorage.setItem('adminEmail', session.user.email || 'admin@example.com');
      localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
    }
    
    return isAdmin;
  } catch (error) {
    console.error('Admin auth check error:', error);
    
    // Fallback to localStorage for compatibility
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData).authenticated === true : false;
  }
};

/**
 * Logout admin user
 */
export const adminLogout = async (): Promise<void> => {
  // Clear admin session from localStorage first for immediate effect
  localStorage.removeItem('adminData');
  localStorage.removeItem('adminEmail');
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  console.log('Admin signed out successfully');
};

/**
 * Verify admin credentials
 */
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Verifying admin credentials for:', email);
    
    // Attempt to sign in with Supabase
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Authentication error:', error.message);
      
      // For demo/testing - allow admin@example.com with password admin123
      if (email === 'admin@example.com' && password === 'admin123') {
        console.log('Using hardcoded admin credentials for testing');
        return true;
      }
      
      return false;
    }
    
    if (!session) return false;
    
    // Check if user is in admin_users table
    const { data, error: adminError } = await supabase.rpc('is_admin', { user_id: session.user.id });
    
    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return false;
    }
    
    const isAdmin = data === true;
    console.log('Login successful, user is admin:', isAdmin);
    
    // Update localStorage for compatibility
    if (isAdmin) {
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
    }
    
    return isAdmin;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};

/**
 * Log admin action to Supabase
 */
export const logAdminAction = async (action: Omit<AdminAction, 'id'>): Promise<AdminAction | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No admin session');
    
    // Use custom insert query to add admin action
    const { data, error } = await supabase.rpc('log_admin_action', {
      p_admin_id: session.user.id,
      p_action_type: action.actionType,
      p_target_id: action.targetId || null,
      p_target_type: action.targetType || null,
      p_reason: action.reason || null,
      p_duration: action.duration || null
    });
    
    if (error) {
      console.error('Error logging admin action:', error);
      return null;
    }
    
    return {
      id: data.id,
      actionType: data.action_type,
      targetId: data.target_id,
      targetType: data.target_type,
      reason: data.reason,
      duration: data.duration,
      timestamp: new Date(data.timestamp),
      adminId: data.admin_id
    };
  } catch (error) {
    console.error('Error in logAdminAction:', error);
    return null;
  }
};

/**
 * Get all admin actions from Supabase
 */
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    // Use a stored procedure to get admin actions
    const { data, error } = await supabase.rpc('get_admin_actions');
    
    if (error) {
      console.error('Error fetching admin actions:', error);
      return [];
    }
    
    return data.map((item: any) => ({
      id: item.id,
      actionType: item.action_type,
      targetId: item.target_id,
      targetType: item.target_type,
      reason: item.reason,
      duration: item.duration,
      timestamp: new Date(item.timestamp),
      adminId: item.admin_id
    }));
  } catch (error) {
    console.error('Error in getAdminActions:', error);
    return [];
  }
};
