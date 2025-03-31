import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types/chat';
import { MAX_CHAR_LIMIT, VIP_CHAR_LIMIT, CONSECUTIVE_LIMIT } from '@/utils/constants';

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
