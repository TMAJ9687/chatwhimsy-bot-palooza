
import { useState, useRef } from 'react';
import { FilterState } from '@/components/chat/FilterMenu';
import { Notification } from '@/components/chat/NotificationSidebar';
import { Message } from '@/components/chat/MessageBubble';

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

export const botProfiles: Bot[] = [
  {
    id: 'bot1',
    name: 'Sophie',
    age: 24,
    gender: 'female',
    country: 'United States',
    countryCode: 'US',
    vip: true,
    interests: ['Music', 'Travel', 'Photography'],
    avatar: '👩🏼',
    responses: [
      "How's your day going? Mine just got better talking to you!",
      "I'm curious to know more about you. What do you enjoy doing?",
      "That's really interesting! Tell me more about yourself.",
      "I love connecting with new people. What brought you here today?"
    ]
  },
  {
    id: 'bot2',
    name: 'Emma',
    age: 27,
    gender: 'female',
    country: 'United Kingdom',
    countryCode: 'GB',
    vip: false,
    interests: ['Books', 'Cooking', 'Yoga'],
    avatar: '👩🏻',
    responses: [
      "I was just thinking about making some tea. Do you prefer coffee or tea?",
      "I just finished a great book. Do you enjoy reading?",
      "I'm trying to improve my cooking skills. Any favorite dishes?",
      "It's so nice to chat with someone new. Tell me about your day!"
    ]
  },
  {
    id: 'bot3',
    name: 'Jack',
    age: 30,
    gender: 'male',
    country: 'Australia',
    countryCode: 'AU',
    vip: false,
    interests: ['Surfing', 'Travel', 'Fitness'],
    avatar: '👨🏼',
    responses: [
      "Just got back from the beach. Do you like the ocean?",
      "I've been trying to stay fit lately. Any workout tips?",
      "I'm planning my next trip. Any travel recommendations?",
      "What's the best place you've ever visited?"
    ]
  }
];

export const getRandomBot = (): Bot => {
  return botProfiles[Math.floor(Math.random() * botProfiles.length)];
};

export const getRandomBotResponse = (botId: string) => {
  const bot = botProfiles.find(b => b.id === botId);
  if (!bot) return "Hello there!";
  return bot.responses[Math.floor(Math.random() * bot.responses.length)];
};

export const sortUsers = (users: typeof botProfiles): typeof botProfiles => {
  return [...users].sort((a, b) => {
    if (a.vip && !b.vip) return -1;
    if (!a.vip && b.vip) return 1;
    
    if (a.country !== b.country) {
      return a.country.localeCompare(b.country);
    }
    
    return a.name.localeCompare(b.name);
  });
};

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
