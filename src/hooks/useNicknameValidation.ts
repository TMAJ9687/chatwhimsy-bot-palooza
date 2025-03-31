
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { validateStandardUsername, validateVipUsername } from '@/utils/userNameValidation';

/**
 * Hook for nickname validation and availability checking against Supabase
 */
export const useNicknameValidation = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  /**
   * Checks if a nickname is available in the database
   */
  const checkNicknameAvailability = useCallback(async (nickname: string, isVip: boolean = false): Promise<boolean> => {
    if (!nickname || nickname.length < 3) {
      setIsAvailable(null);
      setValidationMessage('Nickname must be at least 3 characters long');
      return false;
    }

    // First validate using local rules
    const validation = isVip 
      ? validateVipUsername(nickname)
      : validateStandardUsername(nickname);
    
    if (!validation.valid) {
      setIsAvailable(false);
      setValidationMessage(validation.message);
      return false;
    }

    setIsChecking(true);
    
    try {
      // Check against database
      const { data, error } = await supabase
        .rpc('check_nickname_availability', { nickname_to_check: nickname });
      
      if (error) {
        console.error('Error checking nickname availability:', error);
        setIsAvailable(false);
        setValidationMessage('Error checking nickname availability');
        return false;
      }
      
      setIsAvailable(data);
      setValidationMessage(data ? 'Nickname is available' : 'Nickname is already taken');
      return data;
    } catch (err) {
      console.error('Exception checking nickname availability:', err);
      setIsAvailable(false);
      setValidationMessage('Error checking nickname');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Reserves a nickname in the database
   */
  const reserveNickname = useCallback(async (
    nickname: string, 
    userId?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('nicknames')
        .insert({
          nickname,
          is_temporary: !userId,
          user_id: userId || null
        });
      
      if (error) {
        console.error('Error reserving nickname:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception reserving nickname:', err);
      return false;
    }
  }, []);

  /**
   * Validates and/or reserves a nickname
   * @param nickname The nickname to validate
   * @param isVip Whether to use VIP validation rules
   * @param reserve Whether to reserve the nickname if available
   * @param userId Optional user ID to associate with the nickname
   */
  const validateAndReserveNickname = useCallback(async (
    nickname: string,
    isVip: boolean = false,
    reserve: boolean = false,
    userId?: string
  ): Promise<{ valid: boolean; message: string }> => {
    // First validate the nickname format
    const validation = isVip 
      ? validateVipUsername(nickname)
      : validateStandardUsername(nickname);
    
    if (!validation.valid) {
      return validation;
    }

    // Then check if it's available in the database
    const available = await checkNicknameAvailability(nickname, isVip);
    
    if (!available) {
      return { 
        valid: false, 
        message: validationMessage || 'Nickname is already taken' 
      };
    }
    
    // Reserve the nickname if requested
    if (reserve) {
      const reserved = await reserveNickname(nickname, userId);
      if (!reserved) {
        return { 
          valid: false, 
          message: 'Failed to reserve nickname' 
        };
      }
    }
    
    return { valid: true, message: 'Nickname is valid and available' };
  }, [checkNicknameAvailability, reserveNickname, validationMessage]);

  return {
    isChecking,
    isAvailable,
    validationMessage,
    checkNicknameAvailability,
    reserveNickname,
    validateAndReserveNickname
  };
};

export default useNicknameValidation;
