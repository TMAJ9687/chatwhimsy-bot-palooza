
import { toast } from "@/hooks/use-toast";

// Standard user limits
const MAX_CHAR_LIMIT = 120;
const VIP_CHAR_LIMIT = 200;
const CONSECUTIVE_LIMIT = 3;
const VIP_CONSECUTIVE_CHAR_LIMIT = 6;

export { MAX_CHAR_LIMIT, CONSECUTIVE_LIMIT, VIP_CHAR_LIMIT, VIP_CONSECUTIVE_CHAR_LIMIT };

export const validateImageFile = (file: File): { valid: boolean; message?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      message: "Please select an image file."
    };
  }
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      message: "Image size should be less than 5MB."
    };
  }
  
  return { valid: true };
};

export const validateGifFile = (file: File): { valid: boolean; message?: string } => {
  // Check if it's a GIF
  if (file.type !== 'image/gif') {
    return {
      valid: false,
      message: "Please select a GIF file."
    };
  }
  
  // Check file size (8MB limit for GIFs)
  if (file.size > 8 * 1024 * 1024) {
    return {
      valid: false,
      message: "GIF size should be less than 8MB."
    };
  }
  
  return { valid: true };
};

export const validateVoiceMessage = (duration: number): { valid: boolean; message?: string } => {
  // 2 minutes = 120 seconds
  if (duration > 120) {
    return {
      valid: false,
      message: "Voice messages are limited to 2 minutes."
    };
  }
  
  return { valid: true };
};

export const checkCharacterLimit = (
  text: string, 
  isVip: boolean, 
  showToast: boolean = true
): boolean => {
  const limit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  
  if (text.length > limit) {
    if (showToast) {
      toast({
        title: "Character limit reached",
        description: `Messages are limited to ${limit} characters. ${!isVip ? 'Upgrade to VIP for increased limit.' : ''}`,
        duration: 3000
      });
    }
    return false;
  }
  return true;
};

export const hasConsecutiveChars = (text: string, isVip: boolean = false): boolean => {
  if (!text) return false;
  
  const limit = isVip ? VIP_CONSECUTIVE_CHAR_LIMIT : CONSECUTIVE_LIMIT;
  
  for (let i = 0; i <= text.length - limit; i++) {
    let isConsecutive = true;
    for (let j = 1; j < limit; j++) {
      if (text[i] !== text[i + j]) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) return true;
  }
  return false;
};

export const validateUsername = (username: string, isVip: boolean): { valid: boolean; message?: string } => {
  if (!username) {
    return { valid: false, message: "Username is required" };
  }
  
  // Check length based on user type
  const maxLength = isVip ? 22 : 15;
  if (username.length > maxLength) {
    return { 
      valid: false, 
      message: `Username must be at most ${maxLength} characters long`
    };
  }
  
  // Check for alphanumeric characters
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { 
      valid: false, 
      message: "Username can only contain letters, numbers, and underscores" 
    };
  }
  
  // Check for 'admin' in non-VIP usernames (VIP users can use 'admin')
  if (!isVip && username.toLowerCase().includes('admin')) {
    return { 
      valid: false, 
      message: "Username cannot contain 'admin'" 
    };
  }
  
  // Check for consecutive characters
  if (hasConsecutiveChars(username, isVip)) {
    return { 
      valid: false, 
      message: `Username cannot contain consecutive identical characters` 
    };
  }
  
  return { valid: true };
};
