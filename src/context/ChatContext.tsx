import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { Message } from '@/components/chat/MessageBubble';
import { Notification } from '@/components/chat/NotificationSidebar';
import { FilterState } from '@/components/chat/FilterMenu';
import { trackImageUpload, getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';

// Enhanced bot profiles with more diverse options
const botProfiles = [
  {
    id: 'sophia',
    name: 'Sophia',
    age: 27,
    gender: 'female',
    country: 'Italy',
    countryCode: 'it',
    vip: true,
    interests: ['Cooking', 'Fashion', 'Travel'],
    avatar: 'S',
    responses: [
      "Hi there! How's your day going?",
      "That's interesting! Tell me more about it.",
      "I've never thought about it that way before.",
      "What do you like to do in your free time?",
      "Have you seen any good movies lately?",
    ]
  },
  {
    id: 'alex',
    name: 'Alex',
    age: 29,
    gender: 'male',
    country: 'UK',
    countryCode: 'gb',
    vip: false,
    interests: ['Music', 'Gaming', 'Football'],
    avatar: 'A',
    responses: [
      "Hey, nice to meet you! What brings you here today?",
      "That's cool! I've been into photography lately.",
      "Have you traveled anywhere interesting recently?",
      "What kind of music do you listen to?",
      "Do you have any recommendations for good books?"
    ]
  },
  {
    id: 'sakura',
    name: 'Sakura',
    age: 24,
    gender: 'female',
    country: 'Japan',
    countryCode: 'jp',
    vip: true,
    interests: ['Photography', 'Art', 'Anime'],
    avatar: 'S',
    responses: [
      "こんにちは! Oh sorry, I meant hello!",
      "I'm learning how to cook traditional dishes. Do you like cooking?",
      "I love anime and manga. Do you have any favorites?",
      "What's your favorite season of the year?",
      "I'm planning to travel next month. Any destination suggestions?"
    ]
  },
  {
    id: 'mohammed',
    name: 'Mohammed',
    age: 34,
    gender: 'male',
    country: 'Egypt',
    countryCode: 'eg',
    vip: true,
    interests: ['History', 'Soccer', 'Photography'],
    avatar: 'M',
    responses: [
      "Marhaba! That's hello in Arabic!",
      "I'm fascinated by ancient history. Have you ever visited any historical sites?",
      "What brings you to this chat today?",
      "Soccer is huge here in Egypt. Do you follow any sports?",
      "I'd love to know more about your country and culture."
    ]
  },
  {
    id: 'zara',
    name: 'Zara',
    age: 28,
    gender: 'female',
    country: 'South Africa',
    countryCode: 'za',
    vip: true,
    interests: ['Wildlife', 'Photography', 'Hiking'],
    avatar: 'Z',
    responses: [
      "Hello! How are you doing today?",
      "I love nature and wildlife photography. What about you?",
      "Have you ever been to Africa? It's beautiful here.",
      "What kind of hobbies do you enjoy?",
      "I'm planning a hiking trip next weekend. Do you enjoy outdoor activities?"
    ]
  },
  {
    id: 'carlos',
    name: 'Carlos',
    age: 31,
    gender: 'male',
    country: 'Brazil',
    countryCode: 'br',
    vip: false,
    interests: ['Football', 'Dancing', 'Cooking'],
    avatar: 'C',
    responses: [
      "Olá! That means hello in Portuguese!",
      "I'm a big football fan. Do you follow any sports?",
      "The weather here is amazing today. How is it where you are?",
      "I'm thinking about learning a new language. Any suggestions?",
      "What's your favorite type of cuisine?"
    ]
  },
  {
    id: 'emma',
    name: 'Emma',
    age: 26,
    gender: 'female',
    country: 'France',
    countryCode: 'fr',
    vip: false,
    interests: ['Painting', 'Wine Tasting', 'Literature'],
    avatar: 'E',
    responses: [
      "Bonjour! How are you doing today?",
      "I love discussing art and literature. Any favorite books?",
      "Paris is beautiful in the spring. Have you ever visited?",
      "What do you enjoy doing on weekends?",
      "I'm learning to cook traditional French cuisine. Do you enjoy cooking?"
    ]
  },
  {
    id: 'diego',
    name: 'Diego',
    age: 30,
    gender: 'male',
    country: 'Argentina',
    countryCode: 'ar',
    vip: true,
    interests: ['Tango', 'Football', 'Guitar'],
    avatar: 'D',
    responses: [
      "Hola! How's everything going?",
      "I'm passionate about tango dancing. Do you dance?",
      "Messi is my hero! Who's your favorite athlete?",
      "Have you ever tried mate? It's our traditional drink here.",
      "I'd love to travel the world someday. What places would you recommend?"
    ]
  },
  {
    id: 'liu',
    name: 'Liu',
    age: 27,
    gender: 'male',
    country: 'China',
    countryCode: 'cn',
    vip: false,
    interests: ['Calligraphy', 'Technology', 'Hiking'],
    avatar: 'L',
    responses: [
      "Ni hao! That's hello in Mandarin!",
      "I work in tech and love exploring new gadgets. What about you?",
      "Chinese calligraphy is an ancient art. Do you have any artistic hobbies?",
      "I enjoy hiking in the mountains when I get time off work.",
      "What's your favorite food? I could tell you about some amazing Chinese dishes!"
    ]
  },
  {
    id: 'aisha',
    name: 'Aisha',
    age: 25,
    gender: 'female',
    country: 'UAE',
    countryCode: 'ae',
    vip: true,
    interests: ['Fashion Design', 'Travel', 'Cooking'],
    avatar: 'A',
    responses: [
      "Marhaba! How's your day going?",
      "I'm studying fashion design. What are you passionate about?",
      "Dubai has amazing architecture. Have you ever visited?",
      "I love trying cuisines from different countries. What's your favorite food?",
      "What places are on your travel bucket list?"
    ]
  }
];

// Helper functions
const getRandomBot = () => {
  return botProfiles[Math.floor(Math.random() * botProfiles.length)];
};

const getRandomBotResponse = (botId: string) => {
  const bot = botProfiles.find(b => b.id === botId);
  if (!bot) return "Hello there!";
  return bot.responses[Math.floor(Math.random() * bot.responses.length)];
};

// Function to sort users properly
const sortUsers = (users: typeof botProfiles): typeof botProfiles => {
  return [...users].sort((a, b) => {
    // VIP users are always first
    if (a.vip && !b.vip) return -1;
    if (!a.vip && b.vip) return 1;
    
    // If both are VIP or both are not VIP, sort by country alphabetically
    if (a.country !== b.country) {
      return a.country.localeCompare(b.country);
    }
    
    // If countries are the same, sort by name
    return a.name.localeCompare(b.name);
  });
};

// Types
export type Bot = typeof botProfiles[0];

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
  openConversationFromNotification: (senderId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management
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
  
  // Track if a bot is currently typing in each chat
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  
  // Use a ref to track the current bot ID to handle async operations
  const currentBotIdRef = useRef<string>(currentBot.id);
  
  // Update the ref whenever currentBot changes
  useEffect(() => {
    currentBotIdRef.current = currentBot.id;
  }, [currentBot.id]);
  
  // Get user's country for sorting and fetch remaining uploads
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        // Use a more reliable IP API
        const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=API_KEY_HERE');
        if (!response.ok) {
          // Fallback to another IP API if the first one fails
          const fallbackResponse = await fetch('https://ipapi.co/json/');
          const data = await fallbackResponse.json();
          setUserCountry(data.country_name || '');
        } else {
          const data = await response.json();
          setUserCountry(data.country_name || '');
        }
      } catch (error) {
        console.error('Error fetching user country:', error);
        // Try another fallback
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
        const remaining = await getRemainingUploads(false); // Assuming standard user
        setImagesRemaining(remaining);
      } catch (error) {
        console.error('Error fetching remaining uploads:', error);
      }
    };
    
    fetchUserCountry();
    fetchRemainingUploads();
  }, []);

  // Sort online users whenever the user's country changes
  useEffect(() => {
    if (userCountry) {
      console.log('Sorting users based on country:', userCountry);
      const sortedUsers = sortUsers(botProfiles);
      setOnlineUsers(sortedUsers);
    }
  }, [userCountry]);

  // Memoized filtered users to prevent recalculation on every render
  const filteredUsers = useMemo(() => {
    const filtered = onlineUsers.filter(user => {
      // Filter by search term
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by gender
      const matchesGender = filters.gender === 'any' || user.gender === filters.gender;
      
      // Filter by age
      const matchesAge = user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1];
      
      // Filter by countries (if any selected)
      const matchesCountry = filters.countries.length === 0 || 
        filters.countries.includes(user.country);
      
      return matchesSearch && matchesGender && matchesAge && matchesCountry;
    });
    
    // Return sorted list
    return filtered;
  }, [onlineUsers, searchTerm, filters]);

  // Initialize chat for current bot if it doesn't exist
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

  // Define selectUser before it's used in any other function
  // Handle user selection - optimized with useCallback
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

  // Handle blocking a user - optimized with useCallback
  const handleBlockUser = useCallback(() => {
    // Remove user from online users
    setOnlineUsers(prev => prev.filter(user => user.id !== currentBot.id));
    
    // Select a new user if available
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, selectUser]);

  // Handle closing a chat
  const handleCloseChat = useCallback(() => {
    // If there are other users, select a new one
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, selectUser]);

  // Handle sending text messages - optimized with useCallback
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

    // Add notification for this message
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

  // Handle sending image messages - optimized with useCallback
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
    
    // Track the upload and update remaining count
    try {
      const remaining = await trackImageUpload();
      setImagesRemaining(remaining);
    } catch (error) {
      console.error('Error tracking image upload:', error);
    }
    
    // Add notification for this image message
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

  // New function to open a conversation from notification
  const openConversationFromNotification = useCallback((senderId: string) => {
    // Find the bot with the matching ID
    const bot = onlineUsers.find(user => user.id === senderId);
    if (bot) {
      // Select this user to open their conversation
      selectUser(bot);
      // Close the inbox
      setShowInbox(false);
    }
  }, [onlineUsers, selectUser, setShowInbox]);

  // Modified notification handling to prevent duplicates
  useEffect(() => {
    if (!typingBots) return;
    
    // Mark notifications as read when viewing that user's conversation
    if (currentBot) {
      setUnreadNotifications(prev => 
        prev.map(notif => {
          // Find notifications that match the current bot's name
          if (notif.title.includes(currentBot.name)) {
            return { ...notif, read: true };
          }
          return notif;
        })
      );
    }
  }, [currentBot, typingBots]);

  // Modified function to handle bot responses
  const simulateBotResponse = useCallback((messageId: string, botId: string) => {
    // Track which bot is typing
    setTypingBots(prev => ({
      ...prev,
      [botId]: true
    }));

    // Use a single setState for all status updates
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

    // Only show status updates for VIP users
    const botProfile = botProfiles.find(b => b.id === botId);
    const isVipChat = botProfile?.vip || false;
    
    // Schedule status updates only for VIP users
    if (isVipChat) {
      setTimeout(() => updateMessageStatus('sent'), 500);
      setTimeout(() => updateMessageStatus('delivered'), 1000);
    }
    
    // Bot sends response
    setTimeout(() => {
      // Check if this is still the current bot
      const isCurrent = currentBotIdRef.current === botId;
      
      // Update typing status
      setTypingBots(prev => ({
        ...prev,
        [botId]: false
      }));
      
      setUserChats(prev => {
        // Get the messages for this specific bot
        const botMessages = [...(prev[botId] || [])];
        
        // Update message status (specifying the exact type) - only for VIP users
        const updatedMessages = botMessages.map(msg => 
          (msg.sender === 'user' && isVipChat) ? { ...msg, status: 'read' as const } : msg
        );
        
        // Generate bot response
        const botResponse = {
          id: `bot-${Date.now()}`,
          content: getRandomBotResponse(botId),
          sender: 'bot' as const,
          timestamp: new Date(),
        };
        
        // Add notification for new message from bot, but only if not already present
        if (!isCurrent) {
          const botProfile = botProfiles.find(b => b.id === botId);
          
          if (botProfile) {
            // Check if we already have a notification from this sender
            const existingNotifIndex = unreadNotifications.findIndex(
              n => n.title.includes(botProfile.name)
            );
            
            if (existingNotifIndex >= 0) {
              // Update existing notification instead of creating a new one
              const updatedNotifications = [...unreadNotifications];
              updatedNotifications[existingNotifIndex] = {
                ...updatedNotifications[existingNotifIndex],
                message: `${botProfile.name} sent you a new message`,
                time: new Date(),
                read: false
              };
              
              setUnreadNotifications(updatedNotifications);
            } else {
              // Create new notification
              const newNotification: Notification = {
                id: Date.now().toString(),
                title: `New message from ${botProfile.name}`,
                message: `${botProfile.name} sent you a new message`,
                time: new Date(),
                read: false,
                senderId: botProfile.id
              };
              
              setUnreadNotifications(prev => [newNotification, ...prev]);
            }
          }
        }
        
        // Add bot's message
        return {
          ...prev,
          [botId]: [
            ...updatedMessages,
            botResponse
          ]
        };
      });
    }, 3000);
  }, [unreadNotifications]);

  // Filter change handler - optimized with useCallback
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Notification read handler - optimized with useCallback
  const handleNotificationRead = useCallback((id: string) => {
    setUnreadNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  // Calculate unread notification count
  const unreadCount = useMemo(() => 
    unreadNotifications.filter(n => !n.read).length, 
    [unreadNotifications]
  );

  // Check if current user is VIP
  const isVip = currentBot.vip;

  // Context value
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
    openConversationFromNotification
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
