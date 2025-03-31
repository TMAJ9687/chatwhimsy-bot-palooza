
// Constants for message limitations
export const MAX_CHAR_LIMIT = 500;
export const VIP_CHAR_LIMIT = 2000;
export const CONSECUTIVE_LIMIT = 5;

// Validate image file for upload
export const validateImageFile = (file: File, isVip?: boolean): { valid: boolean; error?: string } => {
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

// Check character limit - updated signature with correct parameters
export const checkCharacterLimit = (text: string, isVip: boolean, returnBoolean: boolean = false): { valid: boolean; error?: string } | boolean => {
  const limit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  
  if (text.length > limit) {
    return returnBoolean ? false : {
      valid: false,
      error: `Message exceeds the ${limit} character limit${!isVip ? '. Upgrade to VIP for longer messages' : ''}`
    };
  }
  
  return returnBoolean ? true : { valid: true };
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

// Add hasConsecutiveChars function needed by MessageTextarea
export const hasConsecutiveChars = (text: string, maxConsecutive: number = 5): boolean => {
  if (!text) return false;
  
  for (let i = 0; i < text.length - maxConsecutive + 1; i++) {
    const char = text[i];
    let consecutive = true;
    
    for (let j = 1; j < maxConsecutive; j++) {
      if (text[i + j] !== char) {
        consecutive = false;
        break;
      }
    }
    
    if (consecutive) return true;
  }
  
  return false;
};

// Validate message content with correct parameters
export const validateMessage = (text: string, isVip: boolean): { valid: boolean; error?: string } => {
  // Check character limit
  const charCheck = checkCharacterLimit(text, isVip);
  if ('valid' in charCheck && !charCheck.valid) {
    return charCheck;
  }
  
  // Check consecutive characters
  if (hasConsecutiveChars(text, isVip ? 6 : 5)) {
    return {
      valid: false,
      error: isVip 
        ? "Please avoid sending messages with more than 6 consecutive identical characters."
        : "Please avoid sending messages with more than 5 consecutive identical characters."
    };
  }
  
  return { valid: true };
};
