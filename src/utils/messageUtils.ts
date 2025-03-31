
// Constants for message limitations
export const MAX_CHAR_LIMIT = 500;
export const VIP_CHAR_LIMIT = 2000;
export const CONSECUTIVE_LIMIT = 5;

// Validate image file for upload
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check if it's actually an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }
  
  // Check file size (5MB limit)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Image must be smaller than 5MB' };
  }
  
  return { valid: true };
};

// Check character limit
export const checkCharacterLimit = (text: string, isVip: boolean): { valid: boolean; error?: string } => {
  const limit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  
  if (text.length > limit) {
    return {
      valid: false,
      error: `Message exceeds the ${limit} character limit${!isVip ? '. Upgrade to VIP for longer messages' : ''}`
    };
  }
  
  return { valid: true };
};

// Check for duplicate or spam messages
export const checkSpamMessages = (
  newMessage: string, 
  recentMessages: string[]
): { valid: boolean; error?: string } => {
  if (recentMessages.length >= CONSECUTIVE_LIMIT && recentMessages.every(msg => msg === newMessage)) {
    return {
      valid: false,
      error: 'Too many identical messages sent in a row'
    };
  }
  
  return { valid: true };
};
