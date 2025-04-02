
import { supabase } from '@/integrations/supabase/client';
import { AdminAction } from '@/types/admin';

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
    
    // Check if user is in admin_users table
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    const isAdmin = !!adminUser;
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
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();
    
    if (adminError) {
      console.error('Error checking admin status:', adminError);
      return false;
    }
    
    const isAdmin = !!adminUser;
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
    
    const { data, error } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: session.user.id,
        action_type: action.actionType,
        target_id: action.targetId,
        target_type: action.targetType,
        reason: action.reason,
        duration: action.duration,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
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
    const { data, error } = await supabase
      .from('admin_actions')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin actions:', error);
      return [];
    }
    
    return data.map(item => ({
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
