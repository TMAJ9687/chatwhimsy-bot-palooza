
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isImage?: boolean;
}

export interface MessageProps {
  message: Message;
  isLastInGroup?: boolean;
  showStatus?: boolean;
}
