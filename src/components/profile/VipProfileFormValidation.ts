
// Validation utilities for VIP profile form

import { validateUsername } from '@/utils/userNameValidation';

/**
 * Validates a nickname according to the application rules
 * 
 * @param nickname The nickname to validate
 * @param isVip Whether the user is a VIP
 * @returns Object with validation result and message
 */
export const validateNickname = (nickname: string, isVip: boolean): { valid: boolean; message: string } => {
  // Prevent empty nicknames
  if (!nickname || !nickname.trim()) {
    return { valid: false, message: 'Nickname cannot be empty' };
  }
  
  // Check for minimum length
  if (nickname.trim().length < 3) {
    return { valid: false, message: 'Nickname must be at least 3 characters long' };
  }
  
  // Check for maximum length based on VIP status
  const maxLength = isVip ? 22 : 15;
  if (nickname.trim().length > maxLength) {
    return { 
      valid: false, 
      message: `Nickname cannot be longer than ${maxLength} characters for ${isVip ? 'VIP' : 'standard'} users` 
    };
  }
  
  // Use existing username validation for additional checks
  const validationResult = validateUsername(nickname, isVip);
  
  return validationResult;
};

/**
 * Enforces all nickname validation rules
 * 
 * @param nickname The nickname to validate
 * @param isVip Whether the user is a VIP
 * @returns Validated nickname or throw error with message
 */
export const enforceNicknameValidation = (nickname: string, isVip: boolean): string => {
  const validation = validateNickname(nickname, isVip);
  
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  return nickname.trim();
};
