import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { Message } from '@/components/chat/MessageBubble';
import { Notification } from '@/components/chat/NotificationSidebar';
import { FilterState } from '@/components/chat/FilterMenu';
import { trackImageUpload, getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';

const botProfiles = [
  // Bot profiles remain unchanged
];

const getRandomBot = () => {
  return botProfiles[Math.floor(Math.random() * botProfiles.length)];
};

const getRandomBotResponse = (botId: string) => {
  const bot = botProfiles.find(b => b.id === botId);
  if (!bot) return "Hello there!";
  return bot.responses[Math.floor(Math.random() * bot.responses.length)];
};

const sortUsers = (users: typeof botProfiles): typeof botProfiles => {
  return [...users].sort((a, b) => {
    if (a.vip && !b.vip) return -1;
    if (!a.vip && b.vip) return 1;
    
    if (a.country !== b.country) {
      return a.country.localeCompare(b.country);
    }
    
    return a.name.localeCompare(b.name);
  });
};

interface ChatContextType {
  userChats: Record<string, Message[]>;
  imagesRemaining: number;
  typingBots: Record<string, boolean>;
  currentBot: Bot;
  onlineUsers: Bot[];
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
  handleBlockUser: () => void;
  handleCloseChat: () => void;
  handleSendTextMessage: (text: string) => void;
  handleSendImageMessage: (imageDataUrl: string) => void;
  selectUser: (user: Bot) => void;
  handleFilterChange: (newFilters: FilterState) => void;
  handleNotificationRead: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [imagesRemaining, setImagesRemaining] = useState(IMAGE_UPLOAD_LIMIT);
  const [isTyping, setIsTyping] = useState(false);
  const [currentBot, setCurrentBot] = useState(getRandomBot());
  const [onlineUsers, setOnlineUsers] = useState(sortUsers(botProfiles));
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
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const currentBotIdRef = useRef<string>(currentBot.id);

  useEffect(() => {
    currentBotIdRef.current = currentBot.id;
  }, [currentBot.id]);

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=API_KEY_HERE');
        if (!response.ok) {
          const fallbackResponse = await fetch('https://ipapi.co/json/');
          const data = await fallbackResponse.json();
          setUserCountry(data.country_name || '');
        } else {
          const data = await response.json();
          setUserCountry(data.country_name || '');
        }
      } catch (error) {
        console.error('Error fetching user country:', error);
        try {
          const fallbackResponse = await fetch('https://ipapi.co/json/');
          const data = await fallbackResponse.json();
          setUserCountry(data.country_name || '');
        } catch (fallbackError) {
          console.error('Error with fallback country fetch:', fallbackError);
        }
      }
    };

    const fetchRemainingUploads = async () => {
      try {
        const remaining = await getRemainingUploads(false);
        setImagesRemaining(remaining);
      } catch (error) {
        console.error('Error fetching remaining uploads:', error);
      }
    };

    fetchUserCountry();
    fetchRemainingUploads();
  }, []);

  useEffect(() => {
    if (userCountry) {
      console.log('Sorting users based on country:', userCountry);
      const sortedUsers = sortUsers(botProfiles);
      setOnlineUsers(sortedUsers);
    }
  }, [userCountry]);

  const filteredUsers = useMemo(() => {
    const filtered = onlineUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = filters.gender === 'any' || user.gender === filters.gender;
      const matchesAge = user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1];
      const matchesCountry = filters.countries.length === 0 || 
        filters.countries.includes(user.country);
      return matchesSearch && matchesGender && matchesAge && matchesCountry;
    });
    return filtered;
  }, [onlineUsers, searchTerm, filters]);

  useEffect(() => {
    if (!userChats[currentBot.id]) {
      setUserChats(prev => ({
        ...prev,
        [currentBot.id]: [{
          id: `system-${Date.now()}`,
          content: `Start a conversation with ${currentBot.name}`,
          sender: 'system',
          timestamp: new Date(),
        }]
      }));
    }
  }, [currentBot.id, userChats]);

  const handleBlockUser = useCallback(() => {
    setOnlineUsers(prev => prev.filter(user => user.id !== currentBot.id));
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers]);

  const handleCloseChat = useCallback(() => {
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers]);

  const handleSendTextMessage = useCallback((text: string) => {
    const currentBotId = currentBot.id;
    const currentMessages = userChats[currentBotId] || [];
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Message to ${currentBot.name}`,
      message: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      time: new Date(),
      read: true
    };
    
    setChatHistory(prev => [newNotification, ...prev]);
    
    simulateBotResponse(newMessage.id, currentBotId);
  }, [currentBot.id, currentBot.name, userChats]);

  const handleSendImageMessage = useCallback(async (imageDataUrl: string) => {
    const currentBotId = currentBot.id;
    const currentMessages = userChats[currentBotId] || [];
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: imageDataUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isImage: true,
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));
    
    try {
      const remaining = await trackImageUpload();
      setImagesRemaining(remaining);
    } catch (error) {
      console.error('Error tracking image upload:', error);
    }
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Image sent to ${currentBot.name}`,
      message: 'You sent an image',
      time: new Date(),
      read: true
    };
    
    setChatHistory(prev => [newNotification, ...prev]);
    
    simulateBotResponse(newMessage.id, currentBotId);
  }, [currentBot.id, currentBot.name, userChats]);

  const simulateBotResponse = useCallback((messageId: string, botId: string) => {
    setTypingBots(prev => ({
      ...prev,
      [botId]: true
    }));

    const updateMessageStatus = (status: 'sending' | 'sent' | 'delivered' | 'read') => {
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        return {
          ...prev,
          [botId]: botMessages.map(msg => 
            msg.id === messageId ? { ...msg, status } : msg
          )
        };
      });
    };

    if (isVip) {
      setTimeout(() => updateMessageStatus('sent'), 500);
      setTimeout(() => updateMessageStatus('delivered'), 1000);
    }
    
    setTimeout(() => {
      const isCurrent = currentBotIdRef.current === botId;
      
      setTypingBots(prev => ({
        ...prev,
        [botId]: false
      }));
      
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        
        const updatedMessages = isVip ? 
          botMessages.map(msg => 
            msg.sender === 'user' ? { ...msg, status: 'read' as const } : msg
          ) : botMessages;
        
        const botResponse = {
          id: `bot-${Date.now()}`,
          content: getRandomBotResponse(botId),
          sender: 'bot' as const,
          timestamp: new Date(),
        };
        
        if (!isCurrent) {
          const botProfile = botProfiles.find(b => b.id === botId);
          
          const newNotification: Notification = {
            id: Date.now().toString(),
            title: `New message from ${botProfile?.name || 'User'}`,
            message: botResponse.content.slice(0, 30) + (botResponse.content.length > 30 ? '...' : ''),
            time: new Date(),
            read: false,
            botId: botId
          };
          
          setUnreadNotifications(prev => [newNotification, ...prev]);
        }
        
        return {
          ...prev,
          [botId]: [
            ...updatedMessages,
            botResponse
          ]
        };
      });
    }, 3000);
  }, [isVip]);

  const selectUser = useCallback((user: Bot) => {
    if (user.id !== currentBot.id) {
      setCurrentBot(user);
      
      if (!userChats[user.id]) {
        setUserChats(prev => ({
          ...prev,
          [user.id]: [{
            id: `system-${Date.now()}`,
            content: `Start a conversation with ${user.name}`,
            sender: 'system',
            timestamp: new Date(),
          }]
        }));
      }
    }
  }, [currentBot.id, userChats]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleNotificationRead = useCallback((id: string) => {
    setUnreadNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const unreadCount = useMemo(() => 
    unreadNotifications.filter(n => !n.read).length, 
    [unreadNotifications]
  );

  const isVip = currentBot.vip;

  const contextValue = {
    userChats,
    imagesRemaining,
    typingBots,
    currentBot,
    onlineUsers,
    searchTerm,
    filters,
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    rulesAccepted,
    filteredUsers,
    unreadCount,
    isVip,
    setSearchTerm,
    setFilters,
    setShowInbox,
    setShowHistory,
    setRulesAccepted,
    handleBlockUser,
    handleCloseChat,
    handleSendTextMessage,
    handleSendImageMessage,
    selectUser,
    handleFilterChange,
    handleNotificationRead
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
