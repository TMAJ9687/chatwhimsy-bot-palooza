
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { createSessionToken, generateUUID } from '@/utils/tokenUtils';

/**
 * AuthService provides a unified interface for handling all authentication,
 * supporting both anonymous users (standard) and authenticated users (VIP/admin)
 */
export class AuthService {
  /**
   * Create a temporary (anonymous) user
   * Standard users don't need full registration, just a nickname
   */
  public async createTemporaryUser(nickname: string): Promise<UserProfile | null> {
    try {
      // Generate a session ID and user ID for this temporary user
      const sessionId = generateUUID();
      const userId = generateUUID();
      
      // Create the UserProfile object
      const userProfile: UserProfile = {
        id: userId,
        nickname: nickname,
        email: '',
        gender: 'male',
        age: 25,
        country: 'US',
        interests: [],
        isVip: false,
        subscriptionTier: 'none',
        imagesRemaining: 15,
        voiceMessagesRemaining: 0
      };
      
      // Create session token
      const token = createSessionToken(userId);
      
      // Store in localStorage
      localStorage.setItem('temporaryUserToken', token);
      localStorage.setItem('chatUser', JSON.stringify(userProfile));
      
      // For server-side persistence, we'll store in Supabase if available
      // NOTE: We're commenting out Supabase operations since the session_tokens table doesn't exist
      // We'll need to create a migration for this table later
      /*
      try {
        const { data, error } = await supabase
          .from('session_tokens')
          .insert({
            user_id: userId,
            token: token,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          });
        
        if (error) {
          console.warn('Could not persist temporary user token to Supabase:', error);
          // Continue with local storage only, not critical
        }
      } catch (e) {
        // If Supabase operations fail, we can still rely on localStorage
        console.warn('Error during Supabase operation for temp user:', e);
      }
      */
      
      return userProfile;
    } catch (error) {
      console.error('Error creating temporary user:', error);
      return null;
    }
  }
  
  /**
   * Sign in a VIP user with email and password
   */
  public async signInVipUser(email: string, password: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Error signing in VIP user:', error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user data returned from sign in');
      }
      
      // Get the user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching VIP user profile:', profileError);
        throw profileError;
      }
      
      // Convert to our UserProfile format
      const userProfile: UserProfile = {
        id: data.user.id,
        nickname: profileData.nickname || email.split('@')[0],
        email: email,
        gender: (profileData.gender as 'male' | 'female') || 'male',
        age: profileData.age || 25,
        country: profileData.country || 'US',
        interests: profileData.interests || [],
        isVip: true,
        isAdmin: profileData.is_admin === true,
        subscriptionTier: 'monthly',
        imagesRemaining: 100,
        voiceMessagesRemaining: 50
      };
      
      // Store in localStorage for offline access
      localStorage.setItem('chatUser', JSON.stringify(userProfile));
      localStorage.setItem('vipProfileComplete', 'true');
      
      return userProfile;
    } catch (error) {
      console.error('Error during VIP user sign in:', error);
      return null;
    }
  }
  
  /**
   * Sign in an admin user
   */
  public async signInAdminUser(email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Error signing in admin user:', error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user data returned from sign in');
      }
      
      // Get the user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching admin status:', profileError);
        throw profileError;
      }
      
      const isAdmin = Boolean(profileData?.is_admin);
      
      if (isAdmin) {
        // Store admin status
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
      }
      
      return isAdmin;
    } catch (error) {
      console.error('Error during admin sign in:', error);
      
      // For demo - allow a hardcoded admin login
      if (email === 'admin@example.com' && password === 'admin123') {
        console.log('Using hardcoded admin credentials');
        
        // Store admin status
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
        
        return true;
      }
      
      return false;
    }
  }
  
  /**
   * Sign out a user (VIP or admin)
   */
  public async signOut(): Promise<void> {
    try {
      // Set logout event to enable cross-tab coordination
      localStorage.setItem('logoutEvent', Date.now().toString());
      
      // Clear all user data from localStorage
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      localStorage.removeItem('temporaryUserToken');
      sessionStorage.clear();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      console.log('Sign out completed successfully');
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Force clear localStorage even if Supabase operation fails
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      localStorage.removeItem('temporaryUserToken');
      sessionStorage.clear();
      
      // Try one more time to sign out
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error during retry sign out:', e);
      }
    }
  }
}

// Create a singleton instance
export const authService = new AuthService();
