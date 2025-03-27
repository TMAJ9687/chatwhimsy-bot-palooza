
import { toast } from "@/hooks/use-toast";

const STANDARD_CHAR_LIMIT = 120;
const VIP_CHAR_LIMIT = 200;
const STANDARD_CONSECUTIVE_LIMIT = 3;
const VIP_CONSECUTIVE_LETTERS_LIMIT = 6;
const VIP_CONSECUTIVE_NUMBERS_LIMIT = 3;

export { STANDARD_CHAR_LIMIT, VIP_CHAR_LIMIT, STANDARD_CONSECUTIVE_LIMIT, VIP_CONSECUTIVE_LETTERS_LIMIT, VIP_CONSECUTIVE_NUMBERS_LIMIT };

export const validateImageFile = (file: File, isVip: boolean): { valid: boolean; message?: string } => {
  // Check file type
  const isImage = file.type.startsWith('image/');
  const isGif = file.type === 'image/gif';
  
  if (!isVip && isGif) {
    return {
      valid: false,
      message: "GIF uploads are only available for VIP users."
    };
  }
  
  if (!isImage) {
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

export const validateVoiceFile = (file: File): { valid: boolean; message?: string } => {
  // Check file type
  if (!file.type.startsWith('audio/')) {
    return {
      valid: false,
      message: "Please select an audio file."
    };
  }
  
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      message: "Audio size should be less than 5MB."
    };
  }
  
  return { valid: true };
};

export const checkCharacterLimit = (
  text: string, 
  isVip: boolean, 
  showToast: boolean = true
): boolean => {
  const charLimit = isVip ? VIP_CHAR_LIMIT : STANDARD_CHAR_LIMIT;
  
  if (text.length > charLimit) {
    if (showToast) {
      toast({
        title: "Character limit reached",
        description: `Messages are limited to ${charLimit} characters. ${!isVip ? "Upgrade to VIP for increased limits." : ""}`,
        duration: 3000
      });
    }
    return false;
  }
  return true;
};

export const hasConsecutiveChars = (text: string, isVip: boolean): boolean => {
  if (!text) return false;
  
  // For consecutive letters
  const letterLimit = isVip ? VIP_CONSECUTIVE_LETTERS_LIMIT : STANDARD_CONSECUTIVE_LIMIT;
  const letterRegex = new RegExp(`([a-zA-Z])\\1{${letterLimit - 1},}`, 'g');
  
  // For consecutive numbers
  const numberLimit = isVip ? VIP_CONSECUTIVE_NUMBERS_LIMIT : STANDARD_CONSECUTIVE_LIMIT;
  const numberRegex = new RegExp(`([0-9])\\1{${numberLimit - 1},}`, 'g');
  
  return letterRegex.test(text) || numberRegex.test(text);
};

export const validateUsername = (username: string, isVip: boolean): { valid: boolean; message?: string } => {
  if (!username) return { valid: false, message: "Username is required" };
  
  // Check length
  const maxLength = isVip ? 22 : 15;
  if (username.length > maxLength) {
    return { 
      valid: false, 
      message: `Username must be ${maxLength} characters or less` 
    };
  }
  
  // VIP users have more restrictions
  if (isVip) {
    // Check for 'admin' in the name (case insensitive)
    if (username.toLowerCase().includes('admin')) {
      return { 
        valid: false, 
        message: "VIP usernames cannot contain 'admin'" 
      };
    }
    
    // Check for consecutive letters (only for VIP)
    const consecutiveLettersRegex = /([a-zA-Z])\1{2,}/g;
    if (consecutiveLettersRegex.test(username)) {
      return { 
        valid: false, 
        message: "VIP usernames cannot have more than 2 consecutive letters" 
      };
    }
    
    // Check for consecutive numbers (only for VIP)
    const consecutiveNumbersRegex = /([0-9])\1{1,}/g;
    if (consecutiveNumbersRegex.test(username)) {
      return { 
        valid: false, 
        message: "VIP usernames cannot have consecutive numbers" 
      };
    }
  } else {
    // Standard user validations
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(username)) {
      return { 
        valid: false, 
        message: "Username must contain only letters and numbers" 
      };
    }
  }
  
  return { valid: true };
};
