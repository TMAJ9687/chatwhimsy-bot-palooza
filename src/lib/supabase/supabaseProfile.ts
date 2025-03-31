
import { supabase } from './supabaseClient';
import { UserProfile } from '@/types/user';
import { getCurrentUser } from './supabaseAuth';

/**
 * Get the VIP user's profile from Supabase
 */
export const getVipUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) {
    console.error('Cannot get profile: No user ID provided');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching VIP profile:', error.message);
      return null;
    }
    
    if (!data) {
      console.log('No profile found for user:', userId);
      return null;
    }
    
    // Convert Supabase profile to our UserProfile format
    return {
      id: userId,
      nickname: data.nickname || 'Anonymous',
      email: data.email || '',
      gender: data.gender || 'male',
      age: data.age || 25,
      country: data.country || 'US',
      interests: data.interests || [],
      isVip: true,
      subscriptionTier: 'monthly',
      imagesRemaining: 100,
      voiceMessagesRemaining: 50,
      isAdmin: data.is_admin === true
    };
  } catch (e) {
    console.error('Unexpected error in getVipUserProfile:', e);
    return null;
  }
};

/**
 * Create or update a VIP user profile in Supabase
 */
export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<boolean> => {
  // Handle error when there's no ID gracefully
  if (!profile.id) {
    console.warn('Cannot update profile: No ID provided');
    return false;
  }
  
  try {
    // First, check if we're authenticated - this helps avoid the auth missing errors
    const currentUser = await getCurrentUser();
    
    // For VIP users, we need to ensure they're authenticated before updating their profile
    if (profile.isVip && !currentUser) {
      console.warn('Cannot update VIP profile: User not authenticated');
      // Fall back to local storage only
      try {
        const existingProfile = localStorage.getItem('chatUser');
        if (existingProfile) {
          const updatedProfile = {
            ...JSON.parse(existingProfile),
            ...profile
          };
          localStorage.setItem('chatUser', JSON.stringify(updatedProfile));
          console.log('Updated profile in localStorage only');
          return true;
        }
      } catch (storageError) {
        console.error('Error updating profile in localStorage:', storageError);
      }
      return false;
    }
    
    // Prepare profile data for Supabase - only for VIP users or if we're authenticated
    if (profile.isVip || currentUser) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: profile.id,
          nickname: profile.nickname,
          gender: profile.gender,
          age: profile.age,
          country: profile.country,
          interests: profile.interests,
          is_admin: profile.isAdmin === true
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error updating profile in Supabase:', error.message);
        // Still try to update localStorage as fallback
      }
    }
    
    // Always update localStorage as a fallback
    try {
      const existingProfile = localStorage.getItem('chatUser');
      if (existingProfile) {
        const updatedProfile = {
          ...JSON.parse(existingProfile),
          ...profile
        };
        localStorage.setItem('chatUser', JSON.stringify(updatedProfile));
      } else {
        // Create a new profile if none exists
        localStorage.setItem('chatUser', JSON.stringify(profile));
      }
    } catch (storageError) {
      console.error('Error updating profile in localStorage:', storageError);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Unexpected error in updateUserProfile:', e);
    return false;
  }
};

/**
 * Get a temporary user by token - used for non-authenticated users
 */
export const getTemporaryUserByToken = async (token: string): Promise<UserProfile | null> => {
  // For temporary users, we only support localStorage
  try {
    const userStr = localStorage.getItem('chatUser');
    if (userStr) {
      return JSON.parse(userStr) as UserProfile;
    }
  } catch (e) {
    console.error('Error getting temporary user profile:', e);
  }
  
  return null;
};
