
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
    
    // Try RPC first (most secure method)
    try {
      const { data: isAdmin, error: rpcError } = await supabase.rpc(
        'is_admin',
        { user_id: session.user.id }
      );
      
      if (rpcError) {
        console.error('Error checking admin status with RPC:', rpcError.message);
        // Don't return, continue to fallback
      } else if (isAdmin) {
        console.log('Admin verified via secure RPC function');
        
        // Only store minimal information needed for UI display
        try {
          const { data } = await supabase
            .from('admin_users')
            .select('email')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (data?.email) {
            // Only store for display purposes, not for security checks
            localStorage.setItem('adminEmail', data.email);
          }
        } catch (e) {
          console.warn('Failed to cache admin email');
        }
        
        return true;
      }
    } catch (error) {
      console.error('RPC query failed:', error);
      // Continue to fallback methods
    }
    
    // Fallback: Direct check using database query
    // This is more secure than client-side checks using localStorage
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.log('Error checking admin status via direct query:', error.message);
      } else if (data) {
        console.log('Admin verified via database fallback');
        return true;
      }
    } catch (error) {
      console.error('Direct admin_users query failed:', error);
    }
    
    // No valid admin found
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
      // Try RPC method first - most secure
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc(
          'is_admin',
          { user_id: data.user.id }
        );
        
        if (rpcError) {
          console.error('Error checking admin status with RPC:', rpcError.message);
          // Continue to fallback
        } else if (isAdmin) {
          // Store minimal info for UI display only
          localStorage.setItem('adminEmail', email);
          
          console.log('Admin login successful (RPC check)');
          return true;
        } else {
          console.error('User exists but is not an admin (via RPC check)');
          return false;
        }
      } catch (rpcError) {
        console.error('RPC check failed:', rpcError);
        // Continue to fallback
      }
      
      // Fallback: direct check
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id, email')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (adminError) {
          console.error('Error in admin check fallback:', adminError.message);
          // Continue to last resort
        } else if (adminData) {
          // Store minimal info for UI display only
          localStorage.setItem('adminEmail', email);
          
          console.log('Admin login successful (fallback check)');
          return true;
        } else {
          console.error('User exists but is not an admin');
          return false;
        }
      } catch (error) {
        console.error('Direct admin check failed:', error);
      }
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
