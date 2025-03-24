
/**
 * Utility functions for validating usernames/nicknames
 */

// Maximum consecutive characters allowed
const MAX_CONSECUTIVE_CHARS = 2;

// Disallowed words in nicknames
const DISALLOWED_WORDS = ["admin", "administrator", "mod", "moderator"];

// Check if a string contains any of the disallowed words
export const containsDisallowedWord = (nickname: string): boolean => {
  const lowerNickname = nickname.toLowerCase();
  return DISALLOWED_WORDS.some(word => lowerNickname.includes(word));
};

// Check if a string has more than N consecutive identical characters
export const hasConsecutiveChars = (nickname: string): boolean => {
  const regex = new RegExp(`([a-zA-Z0-9])\\1{${MAX_CONSECUTIVE_CHARS},}`, 'g');
  return regex.test(nickname);
};

// Get max length based on user type
export const getMaxNicknameLength = (isVip: boolean): number => {
  return isVip ? 22 : 16;
};

// Main validation function
export const validateNickname = (
  nickname: string, 
  isVip: boolean = false
): { isValid: boolean; errorMessage: string } => {
  // Check for empty nickname
  if (!nickname || nickname.trim() === '') {
    return { isValid: false, errorMessage: "Nickname cannot be empty" };
  }

  // Check for disallowed words
  if (containsDisallowedWord(nickname)) {
    return { 
      isValid: false, 
      errorMessage: "Nickname contains a reserved or disallowed word" 
    };
  }

  // Check for consecutive characters
  if (hasConsecutiveChars(nickname)) {
    return { 
      isValid: false, 
      errorMessage: `Nickname cannot contain more than ${MAX_CONSECUTIVE_CHARS} consecutive identical characters` 
    };
  }

  // Check max length
  const maxLength = getMaxNicknameLength(isVip);
  if (nickname.length > maxLength) {
    return { 
      isValid: false, 
      errorMessage: `Nickname cannot be longer than ${maxLength} characters` 
    };
  }

  // If all validations pass
  return { isValid: true, errorMessage: '' };
};

// Utility to help with input validation in real-time
export const validateNicknameInput = (
  nickname: string,
  currentNickname: string,
  isVip: boolean = false
): string => {
  // If we're typing a disallowed word, don't allow it
  if (DISALLOWED_WORDS.some(word => {
    const partial = word.substring(0, nickname.length);
    return nickname.toLowerCase() === partial;
  })) {
    return currentNickname;
  }
  
  // Check length
  const maxLength = getMaxNicknameLength(isVip);
  if (nickname.length > maxLength) {
    return nickname.substring(0, maxLength);
  }
  
  // If consecutive characters would be introduced
  if (hasConsecutiveChars(nickname)) {
    return currentNickname;
  }
  
  return nickname;
};
