
import { toast } from "@/hooks/use-toast";

const MAX_CHAR_LIMIT = 120;
const CONSECUTIVE_LIMIT = 3;

export { MAX_CHAR_LIMIT, CONSECUTIVE_LIMIT };

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

export const checkCharacterLimit = (
  text: string, 
  isVip: boolean, 
  showToast: boolean = true
): boolean => {
  if (!isVip && text.length > MAX_CHAR_LIMIT) {
    if (showToast) {
      toast({
        title: "Character limit reached",
        description: `Messages are limited to ${MAX_CHAR_LIMIT} characters. Upgrade to VIP for unlimited messaging.`,
        duration: 3000
      });
    }
    return false;
  }
  return true;
};

export const hasConsecutiveChars = (text: string): boolean => {
  if (!text) return false;
  
  for (let i = 0; i <= text.length - CONSECUTIVE_LIMIT; i++) {
    let isConsecutive = true;
    for (let j = 1; j < CONSECUTIVE_LIMIT; j++) {
      if (text[i] !== text[i + j]) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) return true;
  }
  return false;
};

export const validateVoiceMessage = (durationInSeconds: number): { valid: boolean; message?: string } => {
  if (durationInSeconds < 1) {
    return {
      valid: false,
      message: "Voice message is too short. Please record a longer message."
    };
  }
  
  if (durationInSeconds > 120) {
    return {
      valid: false,
      message: "Voice message cannot exceed 2 minutes."
    };
  }
  
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  // Check if username contains 'admin'
  if (username.toLowerCase().includes('admin')) {
    return {
      valid: false,
      message: "Username cannot contain 'admin'"
    };
  }
  
  // Check for consecutive characters (no more than 2 identical consecutive characters)
  for (let i = 0; i < username.length - 2; i++) {
    if (username[i] === username[i + 1] && username[i] === username[i + 2]) {
      return {
        valid: false,
        message: "Username cannot contain more than 2 consecutive identical characters"
      };
    }
  }
  
  // Check for length
  if (username.length > 22) {
    return {
      valid: false,
      message: "Username must be at most 22 characters"
    };
  }
  
  return { valid: true };
};
