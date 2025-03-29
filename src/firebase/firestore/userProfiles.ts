
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config';
import { UserProfile } from '@/types/user';

/**
 * Ensures a user profile has all required fields with proper defaults
 * to prevent redirection issues and race conditions
 */
export const validateUserProfile = (profile: Partial<UserProfile>): UserProfile => {
  // Check for required fields
  if (!profile.id) {
    console.error('Missing required field: id');
    throw new Error('Invalid profile data: missing id');
  }
  
  if (!profile.nickname) {
    console.error('Missing required field: nickname');
    throw new Error('Invalid profile data: missing nickname');
  }
  
  // Create base profile with required fields
  const validatedProfile: UserProfile = {
    id: profile.id,
    nickname: profile.nickname,
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
  
  // Make sure critical fields are present
  if (!existingUser.id && !userData.id) {
    userData.id = generateRandomId();
  }
  
  if (!existingUser.nickname && !userData.nickname) {
    userData.nickname = 'User';
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
 * Keep for backward compatibility and offline fallback
 */
export const saveUserProfile = (profile: Partial<UserProfile>): UserProfile => {
  // Ensure ID and nickname are present
  if (!profile.id) {
    profile.id = generateRandomId();
  }
  
  if (!profile.nickname) {
    profile.nickname = 'User';
  }
  
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

/**
 * Get a user profile from Firestore
 * @param userId The user ID to fetch the profile for
 * @returns The user profile or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) {
    console.error('No user ID provided for getUserProfile');
    return null;
  }
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as UserProfile;
      console.log('Retrieved user from Firestore:', userData.nickname);
      
      // Update localStorage for fallback
      localStorage.setItem('chatUser', JSON.stringify(userData));
      
      if (userData.isVip && userData.gender && userData.age && userData.country) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      return userData;
    } else {
      console.log('User not found in Firestore');
      
      // Fallback to localStorage
      const storedUser = localStorage.getItem('chatUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.id === userId) {
          console.log('Retrieved user from localStorage:', userData.nickname);
          return userData;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile from Firestore:', error);
    
    // Fallback to localStorage
    try {
      const storedUser = localStorage.getItem('chatUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.id === userId) {
          console.log('Retrieved user from localStorage (after Firestore error):', userData.nickname);
          return userData;
        }
      }
    } catch (localError) {
      console.error('Error accessing localStorage fallback:', localError);
    }
    
    return null;
  }
};

/**
 * Get a VIP user profile from Firestore
 * @param userId The user ID to fetch the profile for
 * @returns The VIP user profile or null if not found
 */
export const getVipUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) {
    console.error('No user ID provided for getVipUserProfile');
    return null;
  }
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data() as UserProfile;
      
      if (userData.isVip) {
        console.log('Retrieved VIP user from Firestore:', userData.nickname);
        
        // Update localStorage with VIP profile
        localStorage.setItem('chatUser', JSON.stringify(userData));
        
        if (userData.gender && userData.age && userData.country) {
          localStorage.setItem('vipProfileComplete', 'true');
        }
        
        return userData;
      } else {
        console.log('User found in Firestore but is not a VIP user');
      }
    } else {
      console.log('VIP user not found in Firestore');
      
      // Fallback to localStorage
      const storedUser = localStorage.getItem('chatUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.id === userId && userData.isVip) {
          console.log('Retrieved VIP user from localStorage:', userData.nickname);
          return userData;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting VIP user profile from Firestore:', error);
    
    // Fallback to localStorage
    try {
      const storedUser = localStorage.getItem('chatUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.id === userId && userData.isVip) {
          console.log('Retrieved VIP user from localStorage (after Firestore error):', userData.nickname);
          return userData;
        }
      }
    } catch (localError) {
      console.error('Error accessing localStorage fallback:', localError);
    }
    
    return null;
  }
};

/**
 * Save a user profile to Firestore
 * @param profile The profile to save
 * @returns The saved profile
 */
export const saveUserProfileToFirestore = async (profile: UserProfile): Promise<UserProfile> => {
  // Validate critical fields
  if (!profile) {
    console.error('No profile provided for saveUserProfileToFirestore');
    throw new Error('Invalid profile data');
  }
  
  if (!profile.id) {
    console.error('Missing required field: id');
    throw new Error('Invalid profile data: missing id');
  }
  
  if (!profile.nickname) {
    console.error('Missing required field: nickname');
    throw new Error('Invalid profile data: missing nickname');
  }
  
  try {
    const userDocRef = doc(db, 'users', profile.id);
    const userSnapshot = await getDoc(userDocRef);
    
    if (userSnapshot.exists()) {
      // Update existing user
      await updateDoc(userDocRef, { ...profile });
      console.log('Updated user profile in Firestore:', profile.nickname);
    } else {
      // Create new user
      await setDoc(userDocRef, profile);
      console.log('Created new user profile in Firestore:', profile.nickname);
    }
    
    // Also save to localStorage as a fallback
    localStorage.setItem('chatUser', JSON.stringify(profile));
    
    // Update profile completion status if applicable
    if (profile.isVip && profile.gender && profile.age && profile.country) {
      localStorage.setItem('vipProfileComplete', 'true');
    }
    
    return profile;
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
    
    // Fallback to localStorage
    localStorage.setItem('chatUser', JSON.stringify(profile));
    
    throw error;
  }
};

/**
 * Save a VIP user profile to Firestore
 * @param profile The profile to save
 * @returns The saved profile
 */
export const saveVipUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
  // Validate critical fields
  if (!profile) {
    console.error('No profile provided for saveVipUserProfile');
    throw new Error('Invalid profile data');
  }
  
  if (!profile.id) {
    console.error('Missing required field: id');
    throw new Error('Invalid profile data: missing id');
  }
  
  if (!profile.nickname) {
    console.error('Missing required field: nickname');
    throw new Error('Invalid profile data: missing nickname');
  }
  
  // Ensure the profile is marked as VIP
  profile.isVip = true;
  
  try {
    // Save to Firestore
    return await saveUserProfileToFirestore(profile);
  } catch (error) {
    console.error('Error saving VIP user profile to Firestore:', error);
    
    // Fallback to localStorage
    localStorage.setItem('chatUser', JSON.stringify(profile));
    
    throw error;
  }
};

/**
 * Get all user profiles from Firestore
 * This is primarily for admin purposes
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all user profiles:', error);
    return [];
  }
};

/**
 * Check if profile exists in Firestore
 */
export const checkProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    return userSnapshot.exists();
  } catch (error) {
    console.error('Error checking if profile exists:', error);
    return false;
  }
};

/**
 * Migrate a user profile from localStorage to Firestore
 */
export const migrateUserProfileToFirestore = async (userId: string): Promise<boolean> => {
  try {
    // First check if already in Firestore
    const exists = await checkProfileExists(userId);
    if (exists) {
      console.log('User already exists in Firestore, no migration needed');
      return true;
    }
    
    // Try to get from localStorage
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser) as UserProfile;
      
      if (userData.id === userId) {
        // Save to Firestore
        await saveUserProfileToFirestore(userData);
        console.log('Successfully migrated user profile from localStorage to Firestore');
        return true;
      }
    }
    
    console.log('No matching user profile found in localStorage');
    return false;
  } catch (error) {
    console.error('Error migrating user profile to Firestore:', error);
    return false;
  }
};
