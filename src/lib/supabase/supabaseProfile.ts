
import { supabase, isSupabaseAvailable } from './supabaseClient';
import { UserProfile } from '@/types/user';
import { getCurrentUser } from './supabaseAuth';
import { toast } from '@/hooks/use-toast';

// Get VIP user profile from Supabase based on ID
export const getVipUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseAvailable()) return null;
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error.message);
      return null;
    }
    
    if (!data) return null;
    
    // Convert to our app's UserProfile format
    const profile: UserProfile = {
      id: data.id,
      nickname: data.nickname,
      email: data.email || '',
      gender: data.gender as 'male' | 'female',
      age: data.age,
      country: data.country,
      interests: data.interests,
      isVip: data.is_vip,
      isAdmin: data.is_admin,
      subscriptionTier: data.subscription_tier as 'none' | 'monthly' | 'semiannual' | 'annual',
      imagesRemaining: data.images_remaining,
      voiceMessagesRemaining: data.voice_messages_remaining,
    };
    
    return profile;
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
};

// Get temporary user profile by token
export const getTemporaryUserByToken = async (token: string): Promise<UserProfile | null> => {
  if (!isSupabaseAvailable()) return null;
  
  try {
    // First get the user ID from the session token
    const { data: tokenData, error: tokenError } = await supabase
      .from('session_tokens')
      .select('user_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();
      
    if (tokenError || !tokenData) {
      console.error('Invalid or expired token:', tokenError?.message);
      return null;
    }
    
    // Now get the temporary user record
    const { data: userData, error: userError } = await supabase
      .from('temporary_users')
      .select('*')
      .eq('id', tokenData.user_id)
      .single();
      
    if (userError || !userData) {
      console.error('Error fetching temporary user:', userError?.message);
      return null;
    }
    
    // Convert to our app's UserProfile format
    const profile: UserProfile = {
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
    
    return profile;
  } catch (error) {
    console.error('Unexpected error fetching temporary user:', error);
    return null;
  }
};

// Save VIP user profile to Supabase
export const saveVipUserProfile = async (profile: UserProfile): Promise<boolean> => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, skipping profile save');
    return false;
  }
  
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: profile.id,
        nickname: profile.nickname,
        email: profile.email,
        gender: profile.gender,
        age: profile.age,
        country: profile.country,
        interests: profile.interests,
        is_vip: profile.isVip,
        is_admin: profile.isAdmin || false,
        subscription_tier: profile.subscriptionTier,
        images_remaining: profile.imagesRemaining,
        voice_messages_remaining: profile.voiceMessagesRemaining,
        is_online: true,
        last_active: new Date().toISOString(),
      }, { onConflict: 'id' });
      
    if (error) {
      console.error('Error saving user profile:', error.message);
      return false;
    }
    
    console.log('Profile saved successfully for', profile.nickname);
    return true;
  } catch (error) {
    console.error('Unexpected error saving user profile:', error);
    return false;
  }
};

// Save user profile regardless of VIP status
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<boolean> => {
  // Check if this is an authenticated user
  const user = await getCurrentUser();
  
  if (user) {
    // This is a real auth user, update VIP profile
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (existingProfile) {
        // Update existing profile
        const updatedProfile = {
          ...existingProfile,
          ...profile,
          last_active: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('user_profiles')
          .update({
            nickname: updatedProfile.nickname,
            gender: updatedProfile.gender,
            age: updatedProfile.age,
            country: updatedProfile.country,
            interests: updatedProfile.interests,
            is_vip: updatedProfile.is_vip,
            subscription_tier: updatedProfile.subscription_tier,
            images_remaining: updatedProfile.images_remaining,
            voice_messages_remaining: updatedProfile.voice_messages_remaining,
            last_active: updatedProfile.last_active,
          })
          .eq('id', user.id);
          
        if (error) {
          console.error('Error updating user profile:', error.message);
          return false;
        }
        
        return true;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            nickname: profile.nickname || 'User',
            email: user.email,
            gender: profile.gender || 'male',
            age: profile.age || 25,
            country: profile.country || 'US',
            interests: profile.interests || [],
            is_vip: profile.isVip || false,
            is_admin: profile.isAdmin || false,
            subscription_tier: profile.subscriptionTier || 'none',
            images_remaining: profile.imagesRemaining || 15,
            voice_messages_remaining: profile.voiceMessagesRemaining || 0,
            auth_provider: 'email',
            is_online: true,
            last_active: new Date().toISOString(),
          });
          
        if (error) {
          console.error('Error creating user profile:', error.message);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Unexpected error updating user profile:', error);
      return false;
    }
  } else {
    // Check if this is a temporary user
    const token = localStorage.getItem('temporaryUserToken');
    
    if (token) {
      try {
        // First get the user ID from the session token
        const { data: tokenData, error: tokenError } = await supabase
          .from('session_tokens')
          .select('user_id')
          .eq('token', token)
          .gt('expires_at', new Date().toISOString())
          .single();
          
        if (tokenError || !tokenData) {
          console.error('Invalid or expired temporary user token');
          return false;
        }
        
        // Update the temporary user
        const { error } = await supabase
          .from('temporary_users')
          .update({
            nickname: profile.nickname,
            gender: profile.gender,
            age: profile.age,
            country: profile.country,
            interests: profile.interests,
            images_remaining: profile.imagesRemaining,
            last_active: new Date().toISOString(),
          })
          .eq('id', tokenData.user_id);
          
        if (error) {
          console.error('Error updating temporary user:', error.message);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Unexpected error updating temporary user:', error);
        return false;
      }
    }
  }
  
  return false;
};

// Check if a nickname is available
export const checkNicknameAvailability = async (nickname: string): Promise<boolean> => {
  if (!isSupabaseAvailable()) {
    // If Supabase is not available, just return true and handle conflicts locally
    return true;
  }
  
  try {
    const { data, error } = await supabase
      .rpc('check_nickname_availability', { nickname_to_check: nickname });
      
    if (error) {
      console.error('Error checking nickname availability:', error.message);
      // Default to allowing it if we can't check
      return true;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error('Unexpected error checking nickname availability:', error);
    return true;
  }
};

// Get a random available nickname
export const getRandomNickname = async (gender: 'male' | 'female' = 'male'): Promise<string> => {
  if (!isSupabaseAvailable()) {
    // Fallback random nicknames if Supabase is not available
    const maleNames = ['Rider', 'Hunter', 'Jack', 'Max', 'Leo', 'Rex', 'Duke', 'Ace'];
    const femaleNames = ['Lily', 'Rose', 'Daisy', 'Sky', 'Luna', 'Nova', 'Ruby', 'Pearl'];
    
    const names = gender === 'male' ? maleNames : femaleNames;
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    return `${randomName}${randomNumber}`;
  }
  
  try {
    const { data, error } = await supabase
      .rpc('get_random_nickname', { gender_preference: gender });
      
    if (error) {
      console.error('Error getting random nickname:', error.message);
      throw error;
    }
    
    return data || 'User' + Math.floor(Math.random() * 10000);
  } catch (error) {
    console.error('Unexpected error getting random nickname:', error);
    
    // Fallback to generating a name locally
    const prefix = gender === 'male' ? 'Guy' : 'Girl';
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${prefix}${randomNumber}`;
  }
};

// Check if a profile exists in Supabase
export const checkProfileExists = async (userId: string): Promise<boolean> => {
  if (!isSupabaseAvailable()) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        return false;
      }
      console.error('Error checking if profile exists:', error.message);
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error('Unexpected error checking if profile exists:', error);
    return false;
  }
};

// Migrate user profile from localStorage to Supabase
export const migrateUserProfileToFirestore = async (userId: string): Promise<boolean> => {
  try {
    // Check if profile already exists
    const exists = await checkProfileExists(userId);
    
    if (exists) {
      console.log('Profile already exists in Supabase, no migration needed');
      return true;
    }
    
    // Try to get profile from localStorage
    const profileJson = localStorage.getItem('chatUser');
    
    if (!profileJson) {
      console.log('No profile found in localStorage to migrate');
      return false;
    }
    
    const profile = JSON.parse(profileJson) as UserProfile;
    
    // Make sure the ID matches
    if (profile.id !== userId) {
      console.warn('Profile ID in localStorage doesn\'t match provided ID');
      profile.id = userId;
    }
    
    // Save to Supabase
    const success = await saveVipUserProfile(profile);
    
    if (success) {
      console.log('Successfully migrated profile from localStorage to Supabase');
      
      // Add to nicknames table too
      await supabase.from('nicknames').insert({
        nickname: profile.nickname,
        is_temporary: false,
        user_id: userId
      });
      
      return true;
    } else {
      console.error('Failed to migrate profile to Supabase');
      return false;
    }
  } catch (error) {
    console.error('Error during profile migration:', error);
    return false;
  }
};
