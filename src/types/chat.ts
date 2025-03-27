
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
  duration?: number; // For voice messages, duration in seconds
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

// Message validation constants - these will be used as a fallback
// The actual limits are now in useVipFeatures.tsx
export const MAX_CHAR_LIMIT = 120; // Standard user character limit
export const VIP_CHAR_LIMIT = 200; // VIP user character limit (updated from 500 to 200)
export const CONSECUTIVE_LIMIT = 3;
