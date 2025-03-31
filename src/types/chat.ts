
export interface Bot {
  id: string;
  name: string;
  avatar: string;
  gender: string;
  age: number;
  country: string;
  countryCode: string;
  vip: boolean;
  interests: string[];
  responses: string[];
  personalityTraits: string[];
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isImage?: boolean;
  isVoice?: boolean;
  duration?: number;
  translations?: Translation[];
  replyTo?: string;
  reactions?: Reaction[];
  isDeleted?: boolean;
}

export interface Translation {
  language: string;
  content: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  botId?: string;
}

export interface FilterState {
  gender: string[];
  country: string[];
  age: [number, number];
  vip: boolean | null;
}

// Message status types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
