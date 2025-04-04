
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
        
        // Store email for localStorage fallback
        try {
          const { data } = await supabase
            .from('admin_users')
            .select('email')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (data?.email) {
            localStorage.setItem('adminEmail', data.email);
          } else {
            localStorage.setItem('adminEmail', session.user.email || '');
          }
          
          // Store admin data
          const adminData = {
            id: session.user.id,
            email: data?.email || session.user.email || ''
          };
          localStorage.setItem('adminData', JSON.stringify(adminData));
        } catch (e) {
          console.warn('Failed to cache admin email');
          localStorage.setItem('adminEmail', session.user.email || '');
        }
        
        return true;
      }
    } catch (error) {
      console.error('RPC query failed:', error);
      // Continue to fallback methods
    }
    
    // First fallback: Direct check
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.log('Error checking admin status via direct query:', error.message);
        // Continue to localStorage fallback
      } else if (data) {
        console.log('Admin verified via database fallback');
        
        // Cache for fallback
        localStorage.setItem('adminEmail', data.email || session.user.email || '');
        localStorage.setItem('adminData', JSON.stringify({
          id: session.user.id,
          email: data.email || session.user.email || ''
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Direct admin_users query failed:', error);
      // Continue to localStorage fallback
    }
    
    // Last resort: check localStorage fallback
    const adminEmail = localStorage.getItem('adminEmail');
    if (adminEmail && adminEmail === session.user.email) {
      console.log('Admin verified via localStorage fallback');
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
      // Try RPC method first
      try {
        const { data: isAdmin, error: rpcError } = await supabase.rpc(
          'is_admin',
          { user_id: data.user.id }
        );
        
        if (rpcError) {
          console.error('Error checking admin status with RPC:', rpcError.message);
          // Continue to fallback
        } else if (isAdmin) {
          // Store admin info for fallback
          localStorage.setItem('adminEmail', email);
          localStorage.setItem('adminData', JSON.stringify({ 
            email, 
            id: data.user.id 
          }));
          
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
          // Store admin info for fallback
          localStorage.setItem('adminEmail', email);
          localStorage.setItem('adminData', JSON.stringify({ 
            email, 
            id: data.user.id 
          }));
          
          console.log('Admin login successful (fallback check)');
          return true;
        } else {
          console.error('User exists but is not an admin');
          return false;
        }
      } catch (error) {
        console.error('Direct admin check failed:', error);
        // Continue to potential last check
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
