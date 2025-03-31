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
  languages: string[];
  interests: string[];
  online: boolean;
  vip: boolean;
  verified: boolean;
  lastSeen?: string;
  messageCount?: number;
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
}

// Other types needed for chat functionality can be defined here
