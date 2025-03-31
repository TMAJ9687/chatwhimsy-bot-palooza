
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
