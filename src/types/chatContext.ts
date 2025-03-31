
import { Bot, Translation, Reaction, Notification, FilterState } from './chat';

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
  // Add fields from chat.ts Message type for compatibility
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  receiverId?: string;
  text?: string;
  isRead?: boolean;
  voiceDuration?: number;
}

export interface ChatContextType {
  userChats: Record<string, Message[]>;
  imagesRemaining: number;
  typingBots: Record<string, boolean>;
  currentBot: Bot;
  onlineUsers: Bot[];
  blockedUsers: Set<string>;
  searchTerm: string;
  filters: FilterState;
  unreadNotifications: Notification[];
  chatHistory: Notification[];
  showInbox: boolean;
  showHistory: boolean;
  rulesAccepted: boolean;
  filteredUsers: Bot[];
  unreadCount: number;
  isVip: boolean;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: FilterState) => void;
  setShowInbox: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setRulesAccepted: (accepted: boolean) => void;
  handleBlockUser: (userId: string) => void;
  handleUnblockUser: (userId: string) => void;
  handleCloseChat: () => void;
  handleSendTextMessage: (text: string) => void;
  handleSendImageMessage: (imageDataUrl: string) => void;
  handleSendVoiceMessage: (voiceDataUrl: string, duration: number) => void;
  selectUser: (user: Bot) => void;
  handleFilterChange: (newFilters: FilterState) => void;
  handleNotificationRead: (id: string) => void;
  isUserBlocked: (userId: string) => boolean;
  handleDeleteConversation: (userId: string) => void;
  handleTranslateMessage: (messageId: string, targetLanguage: string) => void;
  getSharedMedia: (userId: string) => { images: Message[], voice: Message[] };
  // VIP features
  handleReplyToMessage: (messageId: string, content: string) => void;
  handleReactToMessage: (messageId: string, emoji: string) => void;
  handleUnsendMessage: (messageId: string) => void;
  replyingToMessage: Message | null;
  setReplyingToMessage: (message: Message | null) => void;
}
