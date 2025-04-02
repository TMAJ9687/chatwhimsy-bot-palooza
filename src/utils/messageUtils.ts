
/**
 * Utilities for handling and validating messages
 */

// Constants for file validation
const MAX_IMAGE_SIZE_STANDARD = 5 * 1024 * 1024; // 5MB for standard users
const MAX_IMAGE_SIZE_VIP = 20 * 1024 * 1024; // 20MB for VIP users

// Allowed image types
const STANDARD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIP_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

// Message validation constants
export const MAX_CHAR_LIMIT = 120; // Standard user character limit
export const VIP_CHAR_LIMIT = 200; // VIP user character limit
export const CONSECUTIVE_LIMIT = 3;

/**
 * Validates an image file based on size and type
 */
export const validateImageFile = (
  file: File, 
  isVip: boolean
): { valid: boolean; message: string } => {
  // Check file size
  const maxSize = isVip ? MAX_IMAGE_SIZE_VIP : MAX_IMAGE_SIZE_STANDARD;
  if (file.size > maxSize) {
    const sizeInMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      message: `File is too large. Maximum size is ${sizeInMb}MB.`
    };
  }
  
  // Check file type
  const allowedTypes = isVip ? VIP_IMAGE_TYPES : STANDARD_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Invalid file type. Supported types: ${isVip ? 'JPEG, PNG, WebP, GIF, SVG' : 'JPEG, PNG, WebP'}.`
    };
  }
  
  return { valid: true, message: 'File is valid' };
};

/**
 * Checks if a message exceeds the character limit
 */
export const checkCharacterLimit = (
  text: string,
  isVip: boolean,
  isSilent: boolean = false
): boolean => {
  const limit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  const withinLimit = text.length <= limit;
  
  if (!withinLimit && !isSilent) {
    console.warn(`Message exceeds character limit: ${text.length}/${limit}`);
  }
  
  return withinLimit;
};

/**
 * Checks if text has too many consecutive identical characters
 */
export const hasConsecutiveChars = (
  text: string,
  isVip: boolean
): boolean => {
  if (!text) return false;
  
  // For VIP users: no more than 3 consecutive identical numbers and 6 consecutive letters
  if (isVip) {
    // Check for consecutive numbers (max 3)
    const numberPattern = /(\d)\1{3,}/;
    if (numberPattern.test(text)) return true;
    
    // Check for consecutive letters (max 6)
    const letterPattern = /([a-zA-Z])\1{6,}/;
    if (letterPattern.test(text)) return true;
    
    return false;
  } else {
    // For standard users: no more than 3 consecutive identical characters
    const pattern = /(.)\1{3,}/;
    return pattern.test(text);
  }
};

