
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { Message } from '@/components/chat/MessageBubble';
import { Notification } from '@/components/chat/NotificationSidebar';
import { FilterState } from '@/components/chat/FilterMenu';
import { useAuth } from './FirebaseAuthContext';
import { useUser } from './UserContext';
import { 
  sendMessage as fbSendMessage, 
  getChatMessages, 
  blockUser, 
  getBlockedUsers, 
  reportUser,
  uploadImage as fbUploadImage
} from '@/services/firebaseService';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

// Define the Bot type
interface Bot {
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

// Define sample bot profiles
const botProfiles: Bot[] = [
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

const getRandomBot = (): Bot => {
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
  reportCurrentUser: (reason: string, details?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Make sure we always have a default bot
  const defaultBot = botProfiles[0];
  
  const { currentUser } = useAuth();
  const { user, isVip: userIsVip } = useUser();
  
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [imagesRemaining, setImagesRemaining] = useState(user?.imagesRemaining || 15);
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [currentBot, setCurrentBot] = useState<Bot>(defaultBot);
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

  // Define isVip here, before it's used
  const isVip = userIsVip || currentBot?.vip || false;

  useEffect(() => {
    currentBotIdRef.current = currentBot.id;
  }, [currentBot.id]);

  // Fetch blocked users when current user changes
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (currentUser) {
        const blocked = await getBlockedUsers(currentUser.uid);
        setBlockedUsers(blocked);
        
        // Filter out blocked users from online users
        setOnlineUsers(prev => prev.filter(user => !blocked.includes(user.id)));
      }
    };
    
    fetchBlockedUsers();
  }, [currentUser]);

  // Subscribe to real-time updates for the current chat
  useEffect(() => {
    if (!currentUser || !currentBot.id) return;
    
    const chatId = `${currentUser.uid}_${currentBot.id}`;
    const chatRef = ref(rtdb, `chats/${chatId}/messages`);
    
    const handleNewMessages = (snapshot: any) => {
      if (snapshot.exists()) {
        const messages = Object.entries(snapshot.val()).map(([id, message]: [string, any]) => ({
          id,
          ...message,
          timestamp: new Date(message.timestamp)
        }));
        
        setUserChats(prev => ({
          ...prev,
          [currentBot.id]: messages
        }));
      }
    };
    
    onValue(chatRef, handleNewMessages);
    
    return () => {
      off(chatRef, 'value', handleNewMessages);
    };
  }, [currentUser, currentBot.id]);

  // Load initial chat messages when selecting a new bot
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!currentUser || !currentBot.id) return;
      
      const chatId = `${currentUser.uid}_${currentBot.id}`;
      const messages = await getChatMessages(chatId);
      
      if (messages.length > 0) {
        setUserChats(prev => ({
          ...prev,
          [currentBot.id]: messages
        }));
      } else {
        // Initialize with system message if no messages exist
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
    };
    
    loadChatMessages();
  }, [currentBot.id, currentUser]);

  // Update imagesRemaining when user isVip or imagesRemaining changes
  useEffect(() => {
    setImagesRemaining(userIsVip ? Infinity : (user?.imagesRemaining || 15));
  }, [userIsVip, user?.imagesRemaining]);

  // User country detection
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

    fetchUserCountry();
  }, []);

  useEffect(() => {
    if (userCountry) {
      console.log('Sorting users based on country:', userCountry);
      const sortedUsers = sortUsers(botProfiles);
      setOnlineUsers(sortedUsers);
    }
  }, [userCountry]);

  const filteredUsers = useMemo(() => {
    // Filter out blocked users
    let filtered = onlineUsers.filter(user => !blockedUsers.includes(user.id));
    
    // Apply search and filter criteria
    filtered = filtered.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = filters.gender === 'any' || user.gender === filters.gender;
      const matchesAge = user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1];
      const matchesCountry = filters.countries.length === 0 || 
        filters.countries.includes(user.country);
      return matchesSearch && matchesGender && matchesAge && matchesCountry;
    });
    
    return filtered;
  }, [onlineUsers, searchTerm, filters, blockedUsers]);

  const handleBlockUser = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Call Firebase to block the user
      await blockUser(currentUser.uid, currentBot.id);
      
      // Update local state
      setBlockedUsers(prev => [...prev, currentBot.id]);
      setOnlineUsers(prev => prev.filter(user => user.id !== currentBot.id));
      
      // Select a new user if available
      if (filteredUsers.length > 1) {
        const newUser = filteredUsers.find(user => user.id !== currentBot.id);
        if (newUser) selectUser(newUser);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }, [currentUser, currentBot.id, filteredUsers]);

  const handleCloseChat = useCallback(() => {
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers]);

  const handleSendTextMessage = useCallback(async (text: string) => {
    if (!currentUser) return;
    
    const currentBotId = currentBot.id;
    const chatId = `${currentUser.uid}_${currentBotId}`;
    
    const newMessage = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    // Update local state optimistically
    setUserChats(prev => {
      const currentMessages = prev[currentBotId] || [];
      return {
        ...prev,
        [currentBotId]: [...currentMessages, newMessage]
      };
    });

    // Send to Firebase
    try {
      await fbSendMessage(chatId, {
        content: text,
        sender: 'user',
        status: 'sent'
      });
      
      // Update message status to sent
      setUserChats(prev => {
        const messages = [...(prev[currentBotId] || [])];
        return {
          ...prev,
          [currentBotId]: messages.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg
          )
        };
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error - maybe set message status to failed
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Message to ${currentBot.name}`,
      message: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      time: new Date(),
      read: true
    };
    
    setChatHistory(prev => [newNotification, ...prev]);
    
    simulateBotResponse(newMessage.id, currentBotId);
  }, [currentUser, currentBot.id, currentBot.name]);

  const handleSendImageMessage = useCallback(async (imageDataUrl: string) => {
    if (!currentUser) return;
    
    const currentBotId = currentBot.id;
    const chatId = `${currentUser.uid}_${currentBotId}`;
    
    // Convert data URL to File object
    const dataURLToFile = (dataUrl: string, filename: string): File => {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      return new File([u8arr], filename, { type: mime });
    };
    
    const file = dataURLToFile(imageDataUrl, `image_${Date.now()}.jpg`);
    
    const newMessage = {
      id: `user-${Date.now()}`,
      content: imageDataUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isImage: true,
    };
    
    // Update local state optimistically
    setUserChats(prev => {
      const currentMessages = prev[currentBotId] || [];
      return {
        ...prev,
        [currentBotId]: [...currentMessages, newMessage]
      };
    });

    try {
      // Upload image to Firebase Storage
      const imageUrl = await fbUploadImage(currentUser.uid, file, chatId);
      
      // Send message with image URL
      await fbSendMessage(chatId, {
        content: imageUrl,
        sender: 'user',
        isImage: true,
        status: 'sent'
      });
      
      // Update message status to sent and replace data URL with Firebase URL
      setUserChats(prev => {
        const messages = [...(prev[currentBotId] || [])];
        return {
          ...prev,
          [currentBotId]: messages.map(msg => 
            msg.id === newMessage.id ? { 
              ...msg, 
              content: imageUrl, 
              status: 'sent' as const 
            } : msg
          )
        };
      });
      
      // Update remaining images if not VIP
      if (!userIsVip) {
        setImagesRemaining(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error sending image:', error);
      // Handle error - maybe set message status to failed
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
  }, [currentUser, currentBot.id, currentBot.name, userIsVip]);

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
      
      // Prepare bot response
      const botResponse = {
        content: getRandomBotResponse(botId),
        sender: 'bot' as const,
      };
      
      // Send bot response to Firebase
      if (currentUser) {
        const chatId = `${currentUser.uid}_${botId}`;
        fbSendMessage(chatId, botResponse)
          .catch(err => console.error('Error sending bot response:', err));
      }
      
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        
        const updatedMessages = isVip ? 
          botMessages.map(msg => 
            msg.sender === 'user' ? { ...msg, status: 'read' as const } : msg
          ) : botMessages;
        
        // We don't need to add the bot response here as it will come through the Firebase listener
        return {
          ...prev,
          [botId]: updatedMessages
        };
      });
      
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
    }, 3000);
  }, [isVip, currentUser]);

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

  const reportCurrentUser = useCallback(async (reason: string, details?: string) => {
    if (!currentUser) return;
    
    try {
      await reportUser(currentUser.uid, currentBot.id, reason, details);
      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      return false;
    }
  }, [currentUser, currentBot.id]);

  const unreadCount = useMemo(() => 
    unreadNotifications.filter(n => !n.read).length, 
    [unreadNotifications]
  );

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
    handleNotificationRead,
    reportCurrentUser
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
