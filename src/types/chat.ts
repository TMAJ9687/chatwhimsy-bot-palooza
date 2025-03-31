
export interface Bot {
  id: string;
  name: string;
  avatar: string;
  gender: string;
  age: number;
  country: string;
  countryCode: string;
  interests: string[];
  vip: boolean;
  responses: string[];
  personalityTraits: string[];
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isBot: boolean;
  isSystem?: boolean;
  type?: 'text' | 'image' | 'voice';
  imageUrl?: string;
  voiceUrl?: string;
  translated?: boolean;
  originalText?: string;
}

// Added Message interface with proper properties
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  status?: MessageStatus;
  isImage?: boolean;
  isVoice?: boolean;
  duration?: number;
  translations?: Translation[];
  replyTo?: string;
  reactions?: Reaction[];
  isDeleted?: boolean;
}

// Added MessageStatus type
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

// Added Translation interface
export interface Translation {
  language: string;
  content: string;
}

// Added Reaction interface
export interface Reaction {
  userId: string;
  emoji: string;
}

// Added Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  botId?: string;
}

// Added FilterState interface
export interface FilterState {
  gender: string[];
  country: string[];
  age: [number, number];
  vip: boolean | null;
}

// Added constants
export const MAX_CHAR_LIMIT = 250;
export const VIP_CHAR_LIMIT = 1000;
export const CONSECUTIVE_LIMIT = 3;
