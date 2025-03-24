import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';

// Define types for our Chat context
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
  image?: string;
  hidden?: boolean;
}

export interface User {
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'message' | 'system' | 'friend';
  userId?: string;
}

export interface ChatContextType {
  userChats: Record<string, Message[]>;
  typingBots: Record<string, boolean>;
  currentBot: User;
  onlineUsers: User[];
  filteredUsers: User[];
  searchTerm: string;
  filters: {
    gender: string[];
    ageRange: [number, number];
    countries: string[];
  };
  unreadNotifications: Notification[];
  chatHistory: Notification[];
  showInbox: boolean;
  showHistory: boolean;
  rulesAccepted: boolean;
  unreadCount: number;
  isVip: boolean;
  imagesRemaining: number;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setFilters: (filters: any) => void;
  setShowInbox: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setRulesAccepted: (accepted: boolean) => void;
  handleBlockUser: () => void;
  handleCloseChat: () => void;
  handleSendTextMessage: (text: string) => void;
  handleSendImageMessage: (image: string) => void;
  selectUser: (user: User) => void;
  handleFilterChange: (filters: any) => void;
  handleNotificationRead: (notificationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Sample data to populate the chat context
const sampleUsers: User[] = [
  {
    id: 'bot1',
    name: 'Sophia',
    age: 24,
    gender: 'female',
    country: 'United States',
    countryCode: 'US',
    vip: true,
    interests: ['Photography', 'Travel', 'Music'],
    avatar: '👧',
    responses: [
      'Hi there! How\'s your day going?',
      'That\'s interesting! Tell me more about it.',
      'I love chatting with new people! What brings you here?',
    ]
  },
  {
    id: 'bot2',
    name: 'Alex',
    age: 29,
    gender: 'male',
    country: 'Canada',
    countryCode: 'CA',
    vip: false,
    interests: ['Gaming', 'Technology', 'Movies'],
    avatar: '👨',
    responses: [
      'Hey! What games are you into?',
      'I\'m a big fan of tech. What\'s new in your world?',
      'Seen any good movies lately?',
    ]
  },
  {
    id: 'bot3',
    name: 'Emily',
    age: 22,
    gender: 'female',
    country: 'United Kingdom',
    countryCode: 'GB',
    vip: false,
    interests: ['Reading', 'Writing', 'Art'],
    avatar: '👩',
    responses: [
      'Hello! What are you reading right now?',
      'I enjoy writing poetry. What kind of art do you like?',
      'It\'s great to meet another book lover!',
    ]
  },
  {
    id: 'bot4',
    name: 'David',
    age: 31,
    gender: 'male',
    country: 'Australia',
    countryCode: 'AU',
    vip: true,
    interests: ['Surfing', 'Hiking', 'Camping'],
    avatar: '🧑',
    responses: [
      'G\'day! How\'s the weather where you are?',
      'I love outdoor adventures. What\'s your favorite hike?',
      'Surfing is my passion. Have you ever tried it?',
    ]
  },
  {
    id: 'bot5',
    name: 'Olivia',
    age: 26,
    gender: 'female',
    country: 'Germany',
    countryCode: 'DE',
    vip: false,
    interests: ['Cooking', 'Baking', 'Travel'],
    avatar: '👩‍🍳',
    responses: [
      'Hallo! What\'s your favorite dish to cook?',
      'I enjoy baking cakes. What\'s your specialty?',
      'Traveling is my therapy. Where should I go next?',
    ]
  }
];

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [currentBot, setCurrentBot] = useState<User>(sampleUsers[0]);
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<User[]>(sampleUsers);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState({
    gender: ['male', 'female'],
    ageRange: [18, 60] as [number, number],
    countries: []
  });
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [chatHistory, setChatHistory] = useState<Notification[]>([]);
  const [showInbox, setShowInbox] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [imagesRemaining, setImagesRemaining] = useState(3);
  const isVip = false; // Set to false by default, would be determined by user subscription

  // Derived state
  const filteredUsers = onlineUsers.filter((user) => {
    // Filter by search term
    if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !user.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    // Filter by gender
    if (filters.gender.length > 0 && !filters.gender.includes(user.gender)) {
      return false;
    }
    
    // Filter by age range
    if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) {
      return false;
    }
    
    // Filter by countries
    if (filters.countries.length > 0 && !filters.countries.includes(user.country)) {
      return false;
    }
    
    return true;
  });

  const unreadCount = unreadNotifications.filter(n => !n.read).length;

  // Actions
  const selectUser = useCallback((user: User) => {
    setCurrentBot(user);
  }, []);

  const handleBlockUser = useCallback(() => {
    setOnlineUsers(prev => prev.filter(user => user.id !== currentBot.id));
    setCurrentBot(prev => {
      // If we blocked the current user, select the first available one
      if (prev.id === currentBot.id && filteredUsers.length > 1) {
        const nextUser = filteredUsers.find(u => u.id !== currentBot.id);
        return nextUser || sampleUsers[0];
      }
      return prev;
    });
  }, [currentBot.id, filteredUsers]);

  const handleCloseChat = useCallback(() => {
    // Just simulate closing the chat by doing nothing in this example
    console.log('Chat closed with', currentBot.name);
  }, [currentBot.name]);

  const handleSendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
      status: 'sent'
    };

    setUserChats(prev => ({
      ...prev,
      [currentBot.id]: [...(prev[currentBot.id] || []), newMessage]
    }));

    // Simulate bot typing
    setTypingBots(prev => ({ ...prev, [currentBot.id]: true }));

    // Simulate bot response after a delay
    setTimeout(() => {
      const randomResponse = currentBot.responses[Math.floor(Math.random() * currentBot.responses.length)];
      
      const botMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: randomResponse,
        sender: 'bot',
        timestamp: Date.now() + 1,
        status: 'read'
      };

      setUserChats(prev => ({
        ...prev,
        [currentBot.id]: [...(prev[currentBot.id] || []), botMessage]
      }));

      setTypingBots(prev => ({ ...prev, [currentBot.id]: false }));
    }, 1500);
  }, [currentBot]);

  const handleSendImageMessage = useCallback((image: string) => {
    if (!image || imagesRemaining <= 0) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      text: '',
      sender: 'user',
      timestamp: Date.now(),
      status: 'sent',
      image,
      hidden: true // Images are hidden by default
    };

    setUserChats(prev => ({
      ...prev,
      [currentBot.id]: [...(prev[currentBot.id] || []), newMessage]
    }));

    // Reduce available images
    setImagesRemaining(prev => Math.max(0, prev - 1));

    // Simulate bot typing
    setTypingBots(prev => ({ ...prev, [currentBot.id]: true }));

    // Simulate bot response after a delay
    setTimeout(() => {
      const botMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: "Thanks for sharing the image!",
        sender: 'bot',
        timestamp: Date.now() + 1,
        status: 'read'
      };

      setUserChats(prev => ({
        ...prev,
        [currentBot.id]: [...(prev[currentBot.id] || []), botMessage]
      }));

      setTypingBots(prev => ({ ...prev, [currentBot.id]: false }));
    }, 1500);
  }, [currentBot.id, imagesRemaining]);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const handleNotificationRead = useCallback((notificationId: string) => {
    setUnreadNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Initialize some chat data
  useEffect(() => {
    // Generate some sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: 'notif1',
        title: 'Welcome to Chat App!',
        message: 'Thanks for joining. Have a great time chatting!',
        timestamp: Date.now() - 3600000,
        read: false,
        type: 'system'
      },
      {
        id: 'notif2',
        title: 'New Message',
        message: 'Sophia sent you a message',
        timestamp: Date.now() - 1800000,
        read: false,
        type: 'message',
        userId: 'bot1'
      }
    ];

    setUnreadNotifications(sampleNotifications);

    // Generate some sample chat history
    const sampleHistory: Notification[] = [
      {
        id: 'hist1',
        title: 'Chat with Sophia',
        message: 'You had a conversation about photography',
        timestamp: Date.now() - 86400000,
        read: true,
        type: 'message',
        userId: 'bot1'
      }
    ];

    setChatHistory(sampleHistory);
  }, []);

  const contextValue: ChatContextType = {
    userChats,
    typingBots,
    currentBot,
    onlineUsers,
    filteredUsers,
    searchTerm,
    filters,
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    rulesAccepted,
    unreadCount,
    isVip,
    imagesRemaining,
    
    // Actions
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

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
