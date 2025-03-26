
import { useState, useRef } from 'react';
import { FilterState } from '@/components/chat/FilterMenu';
import { Notification } from '@/components/chat/NotificationSidebar';
import { Message } from '@/components/chat/types/MessageTypes';
import { Bot } from './types/BotTypes';
import { botProfiles } from './data/botProfiles';
import { sortUsers } from './utils/botUtils';

export { Bot } from './types/BotTypes';
export { getRandomBot, getRandomBotResponse, sortUsers } from './utils/botUtils';
export { botProfiles } from './data/botProfiles';

export const useChatState = (userIsVip: boolean, userImagesRemaining?: number) => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [imagesRemaining, setImagesRemaining] = useState(userIsVip ? Infinity : (userImagesRemaining || 15));
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [currentBot, setCurrentBot] = useState<Bot>(botProfiles[0]);
  const [onlineUsers, setOnlineUsers] = useState<Bot[]>(sortUsers(botProfiles));
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    gender: 'any',
    ageRange: [18, 80],
    countries: []
  });
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [chatHistory, setChatHistory] = useState<Notification[]>([]);
  const [showInbox, setShowInbox] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('');
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const currentBotIdRef = useRef<string>(currentBot.id);

  return {
    userChats, setUserChats,
    imagesRemaining, setImagesRemaining,
    typingBots, setTypingBots,
    currentBot, setCurrentBot,
    onlineUsers, setOnlineUsers,
    searchTerm, setSearchTerm,
    filters, setFilters,
    unreadNotifications, setUnreadNotifications,
    chatHistory, setChatHistory,
    showInbox, setShowInbox,
    showHistory, setShowHistory,
    rulesAccepted, setRulesAccepted,
    userCountry, setUserCountry,
    blockedUsers, setBlockedUsers,
    currentBotIdRef
  };
};
