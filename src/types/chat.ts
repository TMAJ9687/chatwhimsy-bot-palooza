// Define types for chat functionality

export interface FilterState {
  gender: string[];
  country: string[];
  age: [number, number];  
  vip: boolean | null;
  // These must exist to match in some components that expect them
  countries: string[];
  ageRange: [number, number];
}

export interface Bot {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  gender: string;
  age: number;
  country: string;
  countryCode: string; // Added this required property
  languages: string[];
  interests: string[];
  online: boolean;
  vip: boolean;
  verified: boolean;
  responses: string[]; // Added this required property
  lastSeen?: string;
  messageCount?: number;
  personalityTraits?: string[]; // Support existing personalityTraits in botProfiles
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  isImage?: boolean;
  isVoice?: boolean;
  voiceDuration?: number;
  replyTo?: Message | null;
  // Added missing properties from MessageContext.Message
  content?: string;
  sender?: 'user' | 'bot' | 'system';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  translations?: Translation[];
  reactions?: Reaction[];
  isDeleted?: boolean;
  duration?: number;
}

// Add required Translation and Notification types
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

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered', 
  READ = 'read'
}

// Other types needed for chat functionality can be defined here
