import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting Supabase sign in:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Supabase signIn error:", error.message);
      throw error;
    }
    
    console.log('Supabase sign in successful, user:', data.user.email);
    
    return data.user;
  } catch (error: any) {
    console.error("Authentication error:", error.message);
    throw error;
  }
};

/**
 * Create a new user with email and password
 */
export const createUserWithEmail = async (email: string, password: string): Promise<User> => {
  console.log('Creating new user with email:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) {
    console.error("Supabase signup error:", error.message);
    throw error;
  }
  
  if (!data.user) {
    throw new Error("User creation failed");
  }
  
  console.log('User created successfully:', data.user.email);
  return data.user;
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  console.log('Sending password reset email to:', email);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password',
  });
  
  if (error) {
    console.error("Password reset error:", error.message);
    throw error;
  }
  
  console.log('Password reset email sent successfully');
};

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    console.log('Supabase signOut started');
    
    // Set logout event for cross-tab coordination
    localStorage.setItem('logoutEvent', Date.now().toString());
    
    // Clear admin-specific data
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminEmail');
    
    // Clean up UI elements
    try {
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Remove overlay elements
      const overlaySelectors = [
        '.fixed.inset-0',
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]'
      ];
      
      overlaySelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          try {
            if (el.parentNode && document.contains(el)) {
              el.remove();
            }
          } catch (err) {
            // Ignore errors during cleanup
          }
        });
      });
    } catch (err) {
      // Ignore DOM errors
    }
    
    // Systematic data cleanup
    localStorage.removeItem('chatUser');
    localStorage.removeItem('vipProfileComplete');
    sessionStorage.clear();
    
    // Perform actual signOut
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase signOut error:', error);
      throw error;
    }
    
    console.log('Supabase signOut completed successfully');
  } catch (error) {
    console.error('SignOut error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  console.log('Current Supabase user:', data.user ? data.user.email : 'None');
  return data.user;
};

/**
 * Check if user is admin
 */
export const isUserAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) {
    console.log('No user provided for admin check');
    return false;
  }
  
  try {
    // Call the Supabase function to check if user is admin
    const { data, error } = await supabase.rpc('is_admin', {
      user_id: user.id
    });
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    console.log('Admin check for', user.email, ':', data);
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  console.log('Setting up Supabase auth state listener');
  
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Supabase auth state changed:', event, session ? session.user?.email : 'logged out');
    
    const user = session?.user || null;
    
    if (user) {
      // Check if user is admin
      const admin = await isUserAdmin(user);
      
      if (admin) {
        console.log('Admin user detected in auth state change');
        localStorage.setItem('adminEmail', user.email || 'admin@example.com');
        localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
      }
    }
    
    callback(user);
  });
  
  return () => {
    data.subscription.unsubscribe();
  };
};

/**
 * Verify admin credentials
 */
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Verifying admin credentials');
    
    // First try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Authentication error:', error);
      
      return false;
    }
    
    // Check if the user is an admin
    if (data.user) {
      const isAdmin = await isUserAdmin(data.user);
      return isAdmin;
    }
    
    return false;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};
