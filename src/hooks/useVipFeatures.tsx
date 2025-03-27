
import { useUser } from '@/context/UserContext';

export type VipFeature = 
  | 'unlimitedUploads'
  | 'unlimitedMessages'
  | 'longerMessages'
  | 'messageStatus'
  | 'prioritySupport'
  | 'customAvatars'
  | 'voiceMessages'
  | 'gifSupport'
  | 'advancedChatOptions'
  | 'autoAcceptRules'
  | 'realTimeTranslation';

// Constants for VIP and standard users
export const VIP_CHAR_LIMIT = 200;
export const ADMIN_CHAR_LIMIT = 500; // Admins get an extended character limit
export const STANDARD_CHAR_LIMIT = 120;
export const STANDARD_IMAGE_LIMIT = 15;
export const VIP_VOICE_MESSAGE_LIMIT = 120; // 2 minutes * 60 seconds
export const ADMIN_VOICE_MESSAGE_LIMIT = 300; // 5 minutes * 60 seconds

export const useVipFeatures = () => {
  const { isVip, isAdmin, user } = useUser();
  
  const hasFeature = (feature: VipFeature): boolean => {
    if (isAdmin) return true; // Admins have all features
    if (!isVip) return false;
    
    // All VIP users have all features for now
    return true;
  };
  
  const getImagesRemaining = (): number => {
    if (isAdmin) return Infinity; // Admin has unlimited
    if (isVip) return Infinity;
    return user?.imagesRemaining || STANDARD_IMAGE_LIMIT;
  };
  
  const getVoiceMessagesRemaining = (): number => {
    if (isAdmin) return ADMIN_VOICE_MESSAGE_LIMIT;
    if (!isVip) return 0;
    return user?.voiceMessagesRemaining || VIP_VOICE_MESSAGE_LIMIT;
  };
  
  const getCharacterLimit = (): number => {
    if (isAdmin) return ADMIN_CHAR_LIMIT;
    return isVip ? VIP_CHAR_LIMIT : STANDARD_CHAR_LIMIT;
  };
  
  // Check if a file is an allowed image type (including GIFs for VIP users)
  const isAllowedImageType = (file: File): boolean => {
    if (isAdmin) {
      // Admins can upload any image type
      return file.type.startsWith('image/');
    }
    
    if (isVip) {
      // VIP users can upload standard images and GIFs
      return file.type.startsWith('image/');
    } else {
      // Standard users can only upload standard images (no GIFs)
      return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    }
  };
  
  // Validate if consecutive characters match the rules
  const validateConsecutiveChars = (text: string): boolean => {
    if (!text) return true;
    
    // Admins can bypass character validation
    if (isAdmin) return true;
    
    // For VIP users: no more than 3 consecutive identical numbers and 6 consecutive letters
    if (isVip) {
      // Check for consecutive numbers (max 3)
      const numberPattern = /(\d)\1{3,}/;
      if (numberPattern.test(text)) return false;
      
      // Check for consecutive letters (max 6)
      const letterPattern = /([a-zA-Z])\1{6,}/;
      if (letterPattern.test(text)) return false;
      
      return true;
    } else {
      // For standard users: no more than 3 consecutive identical characters
      for (let i = 0; i <= text.length - 3; i++) {
        if (text[i] === text[i + 1] && text[i] === text[i + 2]) {
          return false;
        }
      }
      return true;
    }
  };
  
  // Check if VIP/admin users should automatically bypass rules
  const shouldBypassRules = (): boolean => {
    return isVip || isAdmin;
  };
  
  return {
    isVip,
    isAdmin,
    hasFeature,
    getImagesRemaining,
    getVoiceMessagesRemaining,
    getCharacterLimit,
    isAllowedImageType,
    validateConsecutiveChars,
    shouldBypassRules
  };
};
