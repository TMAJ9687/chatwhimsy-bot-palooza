
import { Message } from '@/types/chat';

/**
 * Validates if a message contains at least some text
 */
export const isValidMessage = (text: string, minLength = 1): { valid: boolean; error?: string } => {
  if (!text || text.trim().length < minLength) {
    return { 
      valid: false, 
      error: `Message must be at least ${minLength} character${minLength > 1 ? 's' : ''} long.` 
    };
  }

  return { valid: true };
};

/**
 * Checks character limits for messages based on user type
 */
export const checkCharacterLimit = (text: string, isVip: boolean, showToast = false): boolean => {
  const maxLength = isVip ? 2000 : 500;
  const isWithinLimit = text.length <= maxLength;
  
  if (!isWithinLimit && showToast) {
    // Toast is shown by the component that calls this, we just return the result
    console.log(`Message exceeds character limit (${maxLength})`);
  }
  
  return isWithinLimit;
};

/**
 * Checks if text has too many consecutive characters (spam prevention)
 */
export const hasConsecutiveChars = (text: string, maxConsecutive = 5): boolean => {
  // Simple regex to detect repeated characters
  const regex = new RegExp(`(.)\\1{${maxConsecutive - 1},}`, 'i');
  return regex.test(text);
};

/**
 * Detects URLs in message text
 */
export const containsUrls = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

/**
 * Validates image before upload - alias for validateImageFile for compatibility
 */
export const validateImage = (file: File, maxSizeMB = 5): { valid: boolean; error?: string } => {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image.' };
  }
  
  // Check size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image must be smaller than ${maxSizeMB}MB.` };
  }
  
  return { valid: true };
};

// Alias for validateImage for code compatibility
export const validateImageFile = validateImage;

/**
 * Validates voice message before upload
 */
export const validateVoiceMessage = (blob: Blob, maxSeconds = 60): { valid: boolean; error?: string } => {
  // Check maximum size (rough estimate based on 128kbps audio)
  const estimatedMaxSize = maxSeconds * 16 * 1024; // 16KB per second at 128kbps
  if (blob.size > estimatedMaxSize) {
    return { valid: false, error: `Voice message cannot be longer than ${maxSeconds} seconds.` };
  }
  
  return { valid: true };
};

// Fixed function signature to return object instead of boolean
export const checkImageLimit = (imagesRemaining: number): { valid: boolean; error?: string } => {
  if (imagesRemaining <= 0) {
    return { 
      valid: false, 
      error: 'You have used all your image uploads for today.' 
    };
  }
  return { valid: true };
};
