
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
  isVoiceMessage?: boolean;
  isGif?: boolean;
  replyToId?: string; // ID of the message being replied to
  replyToContent?: string; // Content of the message being replied to
  replyToSender?: 'user' | 'bot'; // Sender of the message being replied to
  reactions?: string[]; // List of reactions added to this message
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
