
import { Bot, Message, Notification, FilterState } from './chat';

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
  // New VIP features
  handleReplyToMessage: (messageId: string, content: string) => void;
  handleReactToMessage: (messageId: string, emoji: string) => void;
  handleUnsendMessage: (messageId: string) => void;
  replyingToMessage: Message | null;
  setReplyingToMessage: (message: Message | null) => void;
}
