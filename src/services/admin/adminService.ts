
import { supabase } from '@/integrations/supabase/client';
import { AdminAction } from '@/types/admin';

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
    
    // In a real app, you would check admin role via RLS or custom claims
    // For now, we'll use localStorage as a fallback for demo purposes
    const isAdmin = localStorage.getItem('adminEmail') === session.user.email;
    
    if (!isAdmin) {
      // This would typically check against admin roles in the database
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .single();
      
      if (error || !data) {
        console.log('User is not an admin according to database');
        return false;
      }
      
      return true;
    }
    
    return isAdmin;
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
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error('Admin login error:', error.message);
      return false;
    }
    
    if (data.user) {
      // Store admin email in localStorage for demo purposes
      // In a real app, you would rely on server-side role verification
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ email }));
      
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

/**
 * Get admin actions
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
    
    return data || [];
  } catch (error) {
    console.error('Error in getAdminActions:', error);
    return [];
  }
};

/**
 * Log admin action
 */
export const logAdminAction = async (
  actionType: string,
  targetId: string,
  targetType: string,
  reason?: string,
  duration?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_actions')
      .insert({
        action_type: actionType,
        target_id: targetId,
        target_type: targetType,
        reason,
        duration,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging admin action:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in logAdminAction:', error);
    return false;
  }
};
