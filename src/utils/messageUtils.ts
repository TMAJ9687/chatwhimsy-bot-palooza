
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types/chat';
import { SUPPORTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/utils/constants';

// Export these constants directly from messageUtils for backward compatibility
export const MAX_CHAR_LIMIT = 500;
export const VIP_CHAR_LIMIT = 2000;
export const CONSECUTIVE_LIMIT = 5;

// Function to create a new message
export const createMessage = (content: string, sender: 'user' | 'bot', isVip: boolean = false): Message => {
  return {
    id: uuidv4(),
    content: content.substring(0, isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT),
    sender: sender,
    timestamp: new Date(),
    status: 'sending',
  };
};

// Function to truncate message content
export const truncateMessage = (content: string, isVip: boolean = false): string => {
  const limit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  return content.length > limit ? content.substring(0, limit) + '...' : content;
};

// Function to validate message content
export const isValidMessage = (content: string): boolean => {
  return content.trim().length > 0;
};

// Function to check if message exceeds character limit
export const exceedsCharLimit = (content: string, isVip: boolean = false): boolean => {
  return content.length > (isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT);
};

// Function to check character limit and return boolean
export const checkCharacterLimit = (text: string, isVip: boolean, silent: boolean = false): boolean => {
  const limit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  if (text.length > limit) {
    if (!silent) {
      console.warn(`Message exceeds character limit: ${text.length}/${limit}`);
    }
    return false;
  }
  return true;
};

// Function to validate image file
export const validateImageFile = (file: File, isVip: boolean): { valid: boolean, message: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
    };
  }

  // VIPs can upload any image type, standard users have restrictions
  if (!isVip && !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: `Unsupported file type. Please use: ${SUPPORTED_IMAGE_TYPES.join(', ')}`
    };
  }

  return { valid: true, message: '' };
};

// Function to check for consecutive identical characters
export const hasConsecutiveChars = (text: string, isVip: boolean): boolean => {
  // VIP users have higher limits for consecutive characters
  const letterLimit = isVip ? 6 : 3;
  const numberLimit = isVip ? 3 : 3;
  
  // Check for consecutive letters (same case)
  const letterRegex = new RegExp(`([a-zA-Z])\\1{${letterLimit},}`);
  // Check for consecutive numbers
  const numberRegex = new RegExp(`([0-9])\\1{${numberLimit},}`);
  
  return letterRegex.test(text) || numberRegex.test(text);
};

// Function to format timestamp
export const formatTimestamp = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Function to check consecutive message limit
export const checkConsecutiveLimit = (messages: Message[], sender: 'user' | 'bot'): boolean => {
  const recentMessages = messages.slice(-CONSECUTIVE_LIMIT);
  return recentMessages.every(msg => msg.sender === sender);
};
