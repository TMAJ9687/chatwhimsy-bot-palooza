
import React, { useState, useEffect, useRef } from 'react';
import { 
  MoreVertical, 
  X,
  Clock, 
  MessageSquare,
  LogOut, 
  Send, 
  Smile, 
  Image as ImageIcon, 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MessageBubble, { Message } from './MessageBubble';
import Logo from '../shared/Logo';
import { useUser } from '../../context/UserContext';
import UserListItem from './UserListItem';
import SearchInput from './SearchInput';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

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

interface ChatInterfaceProps {
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogout }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [imagesRemaining, setImagesRemaining] = useState(15);
  const [isTyping, setIsTyping] = useState(false);
  const [currentBot, setCurrentBot] = useState(getRandomBot());
  const [onlineUsers, setOnlineUsers] = useState(botProfiles);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Filter online users based on search term
  const filteredUsers = onlineUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Set a welcome message when the component mounts
    if (messages.length === 0) {
      const initialMessage: Message = {
        id: 'initial-greeting',
        content: `Start a conversation with ${currentBot.name}`,
        sender: 'system',
        timestamp: new Date(),
      };
      
      setMessages([initialMessage]);
    }
  }, [currentBot.name, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (imagePreview) {
      const newMessage: Message = {
        id: `user-${Date.now()}`,
        content: imagePreview,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
        isImage: true,
      };
      
      setMessages(prev => [...prev, newMessage]);
      setImagePreview(null);
      setImagesRemaining(prev => prev - 1);
      
      simulateBotResponse(newMessage.id);
      return;
    }

    if (message.trim()) {
      const newMessage: Message = {
        id: `user-${Date.now()}`,
        content: message,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending',
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      simulateBotResponse(newMessage.id);
    }
  };

  const simulateBotResponse = (messageId: string) => {
    // Simulate message sending status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'delivered' as const } : msg
        )
      );
    }, 1000);

    // Bot starts typing
    setTimeout(() => {
      setIsTyping(true);
    }, 1500);

    // Bot sends response
    setTimeout(() => {
      setIsTyping(false);
      
      setMessages(prev => [
        ...prev.map(msg => 
          msg.sender === 'user' ? { ...msg, status: 'read' as const } : msg
        ),
        {
          id: `bot-${Date.now()}`,
          content: getRandomBotResponse(currentBot.id),
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const selectUser = (user: typeof botProfiles[0]) => {
    if (user.id !== currentBot.id) {
      setCurrentBot(user);
      
      setMessages([
        {
          id: `system-${Date.now()}`,
          content: `Start a conversation with ${user.name}`,
          sender: 'system',
          timestamp: new Date(),
        }
      ]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Mobile responsive user list using Sheet component
  const MobileUserList = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="md:hidden flex items-center gap-2 m-2"
          size="sm"
        >
          <MessageSquare className="h-4 w-4" />
          <span>People</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <SearchInput 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search users..."
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-xl font-bold text-orange-500">People</h2>
            <Badge variant="outline">{onlineUsers.length} online</Badge>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map(user => (
              <UserListItem
                key={user.id}
                user={user}
                isActive={user.id === currentBot.id}
                onClick={() => selectUser(user)}
              />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header with icons */}
      <header className="bg-white py-2 px-4 border-b border-border flex items-center justify-end">
        <div className="flex items-center gap-5">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <MessageSquare className="h-5 w-5 text-gray-700" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Clock className="h-5 w-5 text-gray-700" />
          </button>
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - User list */}
        <div className="hidden md:flex flex-col w-[350px] bg-white border-r border-gray-200 overflow-hidden">
          <div className="p-4">
            <SearchInput 
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search Keyword"
            />
          </div>
          
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="text-xl font-bold text-orange-500">People</h2>
            <button className="px-4 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
              Filters
            </button>
          </div>
          
          <div className="px-4 pb-2">
            <Badge variant="outline" className="text-sm">{onlineUsers.length} online</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto border-t border-gray-100">
            {filteredUsers.map(user => (
              <UserListItem
                key={user.id}
                user={user}
                isActive={user.id === currentBot.id}
                onClick={() => selectUser(user)}
              />
            ))}
          </div>
          
          {/* VIP Upgrade Section */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-400">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm">Unlock all features</div>
              </div>
              <button className="px-3 py-1 rounded-md bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Mobile user list trigger */}
        <MobileUserList />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">{currentBot.name}</h2>
              <div className="ml-2 text-pink-500 text-sm">
                {currentBot.gender === 'female' ? 'Female' : 'Male'}, {currentBot.age}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                isLastInGroup={true}
              />
            ))}
            
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm inline-flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            {imagePreview && (
              <div className="mb-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 object-contain rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-1">
              <input
                type="text"
                className="flex-1 bg-transparent border-0 focus:outline-none text-gray-700 py-2 text-sm"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!!imagePreview}
              />
              
              <div className="text-xs text-gray-400 mr-2">
                {message.length}/120
              </div>
              
              <button 
                className="p-1.5 text-gray-500 hover:text-gray-700"
                onClick={() => {}}
              >
                <Smile className="h-5 w-5" />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700"
                onClick={triggerFileInput}
                disabled={imagesRemaining <= 0 || !!imagePreview}
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              
              <button
                className="ml-1 w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={(!message.trim() && !imagePreview)}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
