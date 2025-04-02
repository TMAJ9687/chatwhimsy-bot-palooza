
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
    
    // Check if user is in admin_users table using direct query
    const response = await fetch(`${process.env.SUPABASE_URL || ''}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify({ user_id: session.user.id })
    });
    
    const isAdmin = await response.json();
    console.log('User is admin:', isAdmin);
    
    // Update localStorage for compatibility
    if (isAdmin === true) {
      localStorage.setItem('adminEmail', session.user.email || 'admin@example.com');
      localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
    }
    
    return isAdmin === true;
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
    const response = await fetch(`${process.env.SUPABASE_URL || ''}/rest/v1/rpc/is_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify({ user_id: session.user.id })
    });
    
    const isAdmin = await response.json();
    console.log('Login successful, user is admin:', isAdmin);
    
    // Update localStorage for compatibility
    if (isAdmin === true) {
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
    }
    
    return isAdmin === true;
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
    
    // Use direct fetch to log the admin action
    const response = await fetch(`${process.env.SUPABASE_URL || ''}/rest/v1/rpc/log_admin_action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify({
        p_admin_id: session.user.id,
        p_action_type: action.actionType,
        p_target_id: action.targetId || null,
        p_target_type: action.targetType || null,
        p_reason: action.reason || null,
        p_duration: action.duration || null
      })
    });
    
    if (!response.ok) {
      console.error('Error logging admin action:', await response.text());
      return null;
    }
    
    const data = await response.json();
    
    // Convert the server response to our application type
    return {
      id: data.id,
      actionType: data.action_type as "kick" | "ban" | "unban" | "edit" | "upgrade" | "downgrade",
      targetId: data.target_id,
      targetType: data.target_type as "user" | "bot" | "ip",
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
    // Use direct fetch to get admin actions
    const response = await fetch(`${process.env.SUPABASE_URL || ''}/rest/v1/rpc/get_admin_actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching admin actions:', await response.text());
      return [];
    }
    
    const data = await response.json();
    
    // Map the returned data to our AdminAction type
    return Array.isArray(data) ? data.map((item: any) => ({
      id: item.id,
      actionType: item.action_type as "kick" | "ban" | "unban" | "edit" | "upgrade" | "downgrade",
      targetId: item.target_id,
      targetType: item.target_type as "user" | "bot" | "ip",
      reason: item.reason,
      duration: item.duration,
      timestamp: new Date(item.timestamp),
      adminId: item.admin_id
    })) : [];
  } catch (error) {
    console.error('Error in getAdminActions:', error);
    return [];
  }
};
