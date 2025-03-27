
export interface Bot {
  id: string;
  name: string;
  age: number;
  gender: string;
  country: string;
  countryCode: string;
  vip: boolean;
  interests: string[];
  avatar: string;
  responses: string[];
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  status?: MessageStatus;
  isImage?: boolean;
  isVoice?: boolean;
  duration?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  botId?: string;
}

export type FilterGender = 'male' | 'female' | 'any';

export interface FilterState {
  gender: FilterGender;
  ageRange: [number, number];
  countries: string[];
}

// Message validation constants
export const MAX_CHAR_LIMIT = 120;
export const VIP_CHAR_LIMIT = 200;
export const CONSECUTIVE_LIMIT = 3;
export const CONSECUTIVE_LETTERS_LIMIT = 6;
export const MAX_VOICE_LENGTH = 120; // 2 minutes in seconds
