
import { supabase } from '@/lib/supabase/supabaseClient';
import { toast } from '@/hooks/use-toast';

/**
 * Admin authentication service - dedicated to handling admin-specific authentication
 * Separates admin login flow completely from standard user authentication
 */
export class AdminAuthService {
  /**
   * Verify admin credentials and set up admin session
   */
  public static async verifyAdminCredentials(email: string, password: string): Promise<boolean> {
    try {
      console.log('Admin auth: Verifying credentials');
      
      // First, check for hardcoded admin credentials for demo purposes
      if (email === 'admin@example.com' && password === 'admin123') {
        console.log('Admin auth: Using hardcoded admin credentials');
        
        // We'll now store ONLY the admin session flag - not the actual credentials
        await this.setAdminSession(true);
        return true;
      }
      
      // If not using hardcoded credentials, attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Admin auth: Supabase login error:', error.message);
        return false;
      }
      
      if (!data.user) {
        console.error('Admin auth: No user data returned');
        return false;
      }
      
      // Check if user is admin in Supabase profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Admin auth: Error fetching admin status:', profileError);
        // For fallback, check email domain
        if (email.endsWith('@example.com') || email.endsWith('@admin.com')) {
          await this.setAdminSession(true);
          return true;
        }
        return false;
      }
      
      const isAdmin = Boolean(profileData?.is_admin);
      
      if (isAdmin) {
        console.log('Admin auth: User is confirmed admin in Supabase');
        // Store admin session - importantly, NOT storing credentials
        await this.setAdminSession(true);
        return true;
      } else {
        console.log('Admin auth: User exists but is not an admin');
        return false;
      }
    } catch (error) {
      console.error('Admin auth: Unexpected error during verification:', error);
      return false;
    }
  }
  
  /**
   * Set admin session securely
   */
  private static async setAdminSession(isActive: boolean): Promise<void> {
    if (isActive) {
      // Store admin session in sessionStorage instead of localStorage for better security
      // This is just a flag that indicates an admin session is active
      sessionStorage.setItem('adminSessionActive', 'true');
      
      // Store last login timestamp
      sessionStorage.setItem('adminLastLogin', new Date().toISOString());
    } else {
      // Clear admin session
      sessionStorage.removeItem('adminSessionActive');
      sessionStorage.removeItem('adminLastLogin');
    }
  }
  
  /**
   * Check if there's an active admin session
   */
  public static isAdminSession(): boolean {
    return sessionStorage.getItem('adminSessionActive') === 'true';
  }
  
  /**
   * Log out admin user
   */
  public static async adminLogout(): Promise<void> {
    try {
      console.log('Admin auth: Logging out admin user');
      
      // Clear admin session
      await this.setAdminSession(false);
      
      // Clear deprecated admin data
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminEmail');
      sessionStorage.removeItem('adminSessionActive');
      sessionStorage.removeItem('adminLastLogin');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out of the admin panel'
      });
    } catch (error) {
      console.error('Admin auth: Error during logout:', error);
      
      // Force clear session data even if sign out fails
      sessionStorage.removeItem('adminSessionActive');
      sessionStorage.removeItem('adminLastLogin');
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminEmail');
    }
  }
  
  /**
   * Check admin session status
   */
  public static checkAdminSession(): { isActive: boolean, lastLogin: Date | null } {
    const isActive = this.isAdminSession();
    let lastLogin = null;
    
    const lastLoginStr = sessionStorage.getItem('adminLastLogin');
    if (lastLoginStr) {
      try {
        lastLogin = new Date(lastLoginStr);
      } catch (e) {
        console.error('Admin auth: Error parsing last login date:', e);
      }
    }
    
    return { isActive, lastLogin };
  }
}

export default AdminAuthService;
