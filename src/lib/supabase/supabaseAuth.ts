
import { supabase, isSupabaseAvailable } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { generateUUID, createSessionToken } from '@/utils/tokenUtils';
import { updateUserProfile } from './supabaseProfile';
import { toast } from '@/hooks/use-toast';

// Check if Supabase session exists
export const getSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error.message);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error.message);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Unexpected error getting user:', error);
    return null;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Attempting Supabase sign in:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signIn error:", error.message);
      throw error;
    }

    console.log('Supabase sign in successful, user:', data.user?.email);
    
    // Check if user is admin for session persistence
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();
      
    if (profileData?.is_admin) {
      console.log('Admin user logged in, storing session data');
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
    }
    
    return data.user;
  } catch (error: any) {
    console.error("Supabase signIn error:", error.message);
    throw error;
  }
};

// Create a new user with email and password
export const createUserWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    console.log('Creating new user with email:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signUp error:", error.message);
      throw error;
    }

    console.log('User created successfully:', data.user?.email);
    return data.user;
  } catch (error: any) {
    console.error("Supabase signUp error:", error.message);
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    console.log('Sending password reset email to:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.error("Supabase reset password error:", error.message);
      throw error;
    }
    
    console.log('Password reset email sent successfully');
  } catch (error: any) {
    console.error("Supabase reset password error:", error.message);
    throw error;
  }
};

// Enhanced sign out with better cleanup
export const signOutUser = async (): Promise<void> => {
  try {
    console.log('Supabase signOut started');
    
    // Set logout event to enable cross-tab coordination
    localStorage.setItem('logoutEvent', Date.now().toString());
    
    // Clear admin-specific data first
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminEmail');
    
    // Systematic data cleanup before Supabase signout
    localStorage.removeItem('chatUser');
    localStorage.removeItem('vipProfileComplete');
    sessionStorage.clear();
    
    // Now perform the actual signOut operation
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase signOut error:', error.message);
      throw error;
    }
    
    console.log('Supabase signOut completed successfully');
  } catch (error) {
    console.error('Supabase signOut error:', error);
    
    // Try one more time with additional cleanup
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('Supabase signOut retry succeeded');
    } catch (retryError) {
      console.error('Supabase signOut retry also failed:', retryError);
      throw error;
    }
  }
};

// Check if user is admin
export const isUserAdmin = async (userId: string | null): Promise<boolean> => {
  if (!userId) {
    console.log('No user provided for admin check');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin status:', error.message);
      return false;
    }
    
    const isAdmin = Boolean(data?.is_admin);
    console.log('Admin check for user ID', userId, ':', isAdmin);
    return isAdmin;
  } catch (error) {
    console.error('Unexpected error checking admin status:', error);
    return false;
  }
};

// For standard users - create temporary user
export const createTemporaryUser = async (nickname: string): Promise<UserProfile | null> => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase not available, using localStorage fallback');
    return createLocalTemporaryUser(nickname);
  }
  
  try {
    // First, check if nickname is available
    const { data: isAvailable, error: checkError } = await supabase
      .rpc('check_nickname_availability', { nickname_to_check: nickname });
    
    if (checkError) {
      console.error('Error checking nickname availability:', checkError.message);
      return null;
    }
    
    if (!isAvailable) {
      // Nickname is taken, suggest a random one
      toast({
        title: 'Nickname unavailable',
        description: 'That nickname is already taken. Please try another one.',
        variant: 'destructive',
      });
      return null;
    }
    
    // Generate a session ID for this temporary user
    const sessionId = generateUUID();
    const userId = generateUUID();
    
    // Create the temporary user record
    const { data: userData, error: userError } = await supabase
      .from('temporary_users')
      .insert({
        id: userId,
        nickname: nickname,
        gender: 'male', // Default values
        age: 25,
        country: 'US',
        interests: [],
        images_remaining: 15,
        last_active: new Date().toISOString(),
        session_id: sessionId,
      })
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating temporary user:', userError.message);
      return createLocalTemporaryUser(nickname); // Fallback to local storage
    }
    
    // Also add to nicknames table
    await supabase.from('nicknames').insert({
      nickname: nickname,
      is_temporary: true,
      user_id: userId
    });
    
    // Create session token
    const token = createSessionToken(userId);
    
    // Save to session_tokens
    await supabase.from('session_tokens').insert({
      user_id: userId,
      token: token,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });
    
    // Store token in localStorage
    localStorage.setItem('temporaryUserToken', token);
    
    // Convert to UserProfile format
    const userProfile: UserProfile = {
      id: userData.id,
      nickname: userData.nickname,
      email: '',
      gender: userData.gender as 'male' | 'female',
      age: userData.age,
      country: userData.country,
      interests: userData.interests,
      isVip: false,
      subscriptionTier: 'none',
      imagesRemaining: userData.images_remaining,
      voiceMessagesRemaining: 0,
    };
    
    return userProfile;
  } catch (error) {
    console.error('Error in createTemporaryUser:', error);
    return createLocalTemporaryUser(nickname); // Fallback to local storage
  }
};

// Fallback to create a local temporary user when Supabase is unavailable
const createLocalTemporaryUser = (nickname: string): UserProfile => {
  const userId = generateUUID();
  
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
    voiceMessagesRemaining: 0,
  };
  
  // Store in localStorage
  localStorage.setItem('chatUser', JSON.stringify(userProfile));
  
  return userProfile;
};

// For admin authentication
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Verifying admin credentials');
    
    // Sign in to get the user
    const user = await signInWithEmail(email, password);
    
    if (!user) return false;
    
    // Check if this user is an admin
    const isAdmin = await isUserAdmin(user.id);
    
    return isAdmin;
  } catch (error) {
    console.error('Authentication error:', error);
    
    // For demo - allow a hardcoded admin login
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Using hardcoded admin credentials');
      return true;
    }
    
    return false;
  }
};

// Listen to auth state changes - this now returns an unsubscribe function
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  console.log('Setting up Supabase auth state listener');
  
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Supabase auth state changed:', event, session?.user?.email || 'logged out');
    
    if (session?.user) {
      const isAdmin = await isUserAdmin(session.user.id);
      
      if (isAdmin) {
        // Store admin status in localStorage
        console.log('Admin user detected in auth state change');
        localStorage.setItem('adminEmail', session.user.email || 'admin@example.com');
        localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
      }
    }
    
    callback(session?.user || null);
  });
  
  return data.subscription.unsubscribe;
};
