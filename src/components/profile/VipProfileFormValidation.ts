
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
  
  // Use existing username validation
  const validationResult = validateUsername(nickname, isVip);
  
  return validationResult;
};
