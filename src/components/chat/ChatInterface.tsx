
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { Message } from './MessageBubble';
import { Notification } from './NotificationSidebar';
import { trackImageUpload, getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';

// Import our new components
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInputBar from './MessageInputBar';
import UserList from './UserList';
import MobileUserList from './MobileUserList';
import ChatAppHeader from './ChatAppHeader';
import VipUpgradeSection from './VipUpgradeSection';
import NotificationSidebar from './NotificationSidebar';
import { DialogProvider, useDialog } from '@/context/DialogContext';
import DialogContainer from '@/components/dialogs/DialogContainer';
import { FilterState } from './FilterMenu';

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

const getRandomBot = () => {
  return botProfiles[Math.floor(Math.random() * botProfiles.length)];
};

const getRandomBotResponse = (botId: string) => {
  const bot = botProfiles.find(b => b.id === botId);
  if (!bot) return "Hello there!";
  return bot.responses[Math.floor(Math.random() * bot.responses.length)];
};

// Function to sort users based on the requirements
const sortUsers = (users: typeof botProfiles, userCountry: string): typeof botProfiles => {
  return [...users].sort((a, b) => {
    // VIP users are always first
    if (a.vip && !b.vip) return -1;
    if (!a.vip && b.vip) return 1;
    
    // If both are VIP or both are not VIP, sort by country with user's country first
    if (a.country === userCountry && b.country !== userCountry) return -1;
    if (a.country !== userCountry && b.country === userCountry) return 1;
    
    // Then sort alphabetically by country
    if (a.country !== b.country) return a.country.localeCompare(b.country);
    
    // If countries are the same, sort by name
    return a.name.localeCompare(b.name);
  });
};

interface ChatInterfaceProps {
  onLogout: () => void;
}

// Main component that uses our new dialog context
const ChatInterfaceContent: React.FC<ChatInterfaceProps> = ({ onLogout }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  
  // State management
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [imagesRemaining, setImagesRemaining] = useState(IMAGE_UPLOAD_LIMIT);
  const [isTyping, setIsTyping] = useState(false);
  const [currentBot, setCurrentBot] = useState(getRandomBot());
  const [onlineUsers, setOnlineUsers] = useState(botProfiles);
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
  
  // Get user's country for sorting and fetch remaining uploads
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserCountry(data.country_name || '');
      } catch (error) {
        console.error('Error fetching user country:', error);
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
      const sortedUsers = sortUsers(botProfiles, userCountry);
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

  // Show site rules dialog after 3 seconds, but only if rules haven't been accepted yet
  useEffect(() => {
    // Only show the dialog if rules haven't been accepted yet
    if (!rulesAccepted) {
      const timer = setTimeout(() => {
        openDialog('siteRules', { 
          onAccept: () => {
            // Mark rules as accepted when user clicks Accept
            setRulesAccepted(true);
          } 
        });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [openDialog, rulesAccepted]);

  // Handle blocking a user - optimized with useCallback
  const handleBlockUser = useCallback(() => {
    // Remove user from online users
    setOnlineUsers(prev => prev.filter(user => user.id !== currentBot.id));
    
    // Select a new user if available
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers]);

  // Handle closing a chat
  const handleCloseChat = useCallback(() => {
    // If there are other users, select a new one
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers]);

  // Handle sending text messages - optimized with useCallback
  const handleSendTextMessage = useCallback((text: string) => {
    const currentMessages = userChats[currentBot.id] || [];
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBot.id]: [...currentMessages, newMessage]
    }));
    
    simulateBotResponse(newMessage.id, currentBot.id);
  }, [currentBot.id, userChats]);

  // Handle sending image messages - optimized with useCallback
  const handleSendImageMessage = useCallback(async (imageDataUrl: string) => {
    const currentMessages = userChats[currentBot.id] || [];
    
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
      [currentBot.id]: [...currentMessages, newMessage]
    }));
    
    // Track the upload and update remaining count
    try {
      const remaining = await trackImageUpload();
      setImagesRemaining(remaining);
    } catch (error) {
      console.error('Error tracking image upload:', error);
    }
    
    simulateBotResponse(newMessage.id, currentBot.id);
  }, [currentBot.id, userChats]);

  // Simulate bot response - optimized to prevent state thrashing
  const simulateBotResponse = useCallback((messageId: string, botId: string) => {
    // Add to chat history
    setChatHistory(prev => [{
      id: Date.now().toString(),
      title: `Message to ${currentBot.name}`,
      message: 'You sent a message',
      time: new Date(),
      read: true
    }, ...prev]);

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

    // Schedule status updates
    setTimeout(() => updateMessageStatus('sent'), 500);
    setTimeout(() => updateMessageStatus('delivered'), 1000);
    
    // Bot starts typing
    setTimeout(() => setIsTyping(true), 1500);

    // Bot sends response
    setTimeout(() => {
      setIsTyping(false);
      
      setUserChats(prev => {
        // Get the messages for this specific bot
        const botMessages = [...(prev[botId] || [])];
        
        // Update message status (specifying the exact type)
        const updatedMessages = botMessages.map(msg => 
          msg.sender === 'user' ? { ...msg, status: 'read' as const } : msg
        );
        
        // Add bot's message
        return {
          ...prev,
          [botId]: [
            ...updatedMessages,
            {
              id: `bot-${Date.now()}`,
              content: getRandomBotResponse(botId),
              sender: 'bot' as const,
              timestamp: new Date(),
            }
          ]
        };
      });
    }, 3000);
  }, [currentBot.name]);

  // Handle user selection - optimized with useCallback
  const selectUser = useCallback((user: typeof botProfiles[0]) => {
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

  // Navigation handlers - optimized with useCallback
  const handleLogout = useCallback(() => {
    onLogout();
    navigate('/');
  }, [onLogout, navigate]);

  const handleOpenInbox = useCallback(() => {
    setShowInbox(true);
    setShowHistory(false);
  }, []);

  const handleOpenHistory = useCallback(() => {
    setShowHistory(true);
    setShowInbox(false);
  }, []);

  // Calculate unread notification count
  const unreadCount = useMemo(() => 
    unreadNotifications.filter(n => !n.read).length, 
    [unreadNotifications]
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header with icons */}
      <ChatAppHeader 
        unreadCount={unreadCount}
        onOpenInbox={handleOpenInbox}
        onOpenHistory={handleOpenHistory}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - User list (desktop) */}
        <div className="hidden md:flex flex-col w-[350px] bg-white border-r border-gray-200 overflow-hidden">
          <UserList 
            users={filteredUsers}
            currentUserId={currentBot.id}
            onSelectUser={selectUser}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          {/* VIP Upgrade Section */}
          <VipUpgradeSection />
        </div>

        {/* Mobile user list trigger */}
        <MobileUserList 
          users={filteredUsers}
          currentUserId={currentBot.id}
          onSelectUser={selectUser}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat header component */}
          <ChatHeader 
            currentUser={currentBot}
            onBlockUser={handleBlockUser}
            onCloseChat={handleCloseChat}
          />

          {/* Messages area component */}
          <ChatMessages 
            messages={userChats[currentBot.id] || []}
            isTyping={isTyping}
          />
          
          {/* Message input component */}
          <MessageInputBar
            onSendMessage={handleSendTextMessage}
            onSendImage={handleSendImageMessage}
            imagesRemaining={imagesRemaining}
          />
        </div>
      </div>

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={showInbox}
        onClose={() => setShowInbox(false)}
        notifications={unreadNotifications}
        onNotificationRead={handleNotificationRead}
        type="inbox"
      />

      {/* History Sidebar */}
      <NotificationSidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        notifications={chatHistory}
        onNotificationRead={() => {}}
        type="history"
      />
    </div>
  );
};

// Create a wrapper component that provides the dialog context
const ChatInterface: React.FC<ChatInterfaceProps> = (props) => {
  return (
    <DialogProvider>
      <ChatInterfaceContent {...props} />
      <DialogContainer />
    </DialogProvider>
  );
};

export default ChatInterface;
