
import { UserProfile } from '@/types/user';

/**
 * Ensures a user profile has all required fields with proper defaults
 * to prevent redirection issues and race conditions
 */
export const validateUserProfile = (profile: Partial<UserProfile>): UserProfile => {
  // Create base profile with required fields
  const validatedProfile: UserProfile = {
    id: profile.id || generateRandomId(),
    nickname: profile.nickname || 'User',
    email: profile.email || '',
    gender: profile.gender || 'male',
    age: profile.age || 25,
    country: profile.country || 'US',
    interests: profile.interests || [],
    isVip: profile.isVip === true, // Explicitly convert to boolean
    isAdmin: profile.isAdmin === true, // Explicitly convert to boolean
    subscriptionTier: profile.subscriptionTier || 'none',
    imagesRemaining: profile.imagesRemaining || 15,
    voiceMessagesRemaining: profile.voiceMessagesRemaining || 0
  };
  
  return validatedProfile;
};

/**
 * Generates a random ID for standard users without Firebase auth
 */
const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Merges partial user data with existing user data from localStorage
 */
export const mergeUserProfile = (
  userData: Partial<UserProfile>
): UserProfile => {
  let existingUser: Partial<UserProfile> = {};
  
  try {
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      existingUser = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Error loading existing user data:', e);
  }
  
  // Merge existing data with new data
  const mergedData = {
    ...existingUser,
    ...userData
  };
  
  // Validate and return complete profile
  return validateUserProfile(mergedData);
};

/**
 * Saves the user profile to localStorage with validation
 */
export const saveUserProfile = (profile: Partial<UserProfile>): UserProfile => {
  const validatedProfile = validateUserProfile(profile);
  localStorage.setItem('chatUser', JSON.stringify(validatedProfile));
  
  // Update profile completion status if applicable
  if (validatedProfile.isVip && 
      validatedProfile.gender && 
      validatedProfile.age && 
      validatedProfile.country) {
    localStorage.setItem('vipProfileComplete', 'true');
  }
  
  return validatedProfile;
};
