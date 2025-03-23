import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle, Bell, Image, Star } from 'lucide-react';
import MessageBubble, { Message } from './MessageBubble';
import MessageInput from './MessageInput';
import Logo from '../shared/Logo';
import Button from '../shared/Button';
import { useUser } from '../../context/UserContext';

const botProfiles = [
  {
    id: 'sophia',
    name: 'Sophia',
    age: 24,
    gender: 'female',
    country: 'USA',
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
    age: 28,
    gender: 'male',
    country: 'UK',
    responses: [
      "Hey, nice to meet you! What brings you here today?",
      "That's cool! I've been into photography lately.",
      "Have you traveled anywhere interesting recently?",
      "What kind of music do you listen to?",
      "Do you have any recommendations for good books?"
    ]
  },
  {
    id: 'mei',
    name: 'Mei',
    age: 22,
    gender: 'female',
    country: 'Japan',
    responses: [
      "こんにちは! Oh sorry, I meant hello!",
      "I'm learning how to cook traditional dishes. Do you like cooking?",
      "I love anime and manga. Do you have any favorites?",
      "What's your favorite season of the year?",
      "I'm planning to travel next month. Any destination suggestions?"
    ]
  },
  {
    id: 'carlos',
    name: 'Carlos',
    age: 31,
    gender: 'male',
    country: 'Brazil',
    responses: [
      "Olá! That means hello in Portuguese!",
      "I'm a big football fan. Do you follow any sports?",
      "The weather here is amazing today. How is it where you are?",
      "I'm thinking about learning a new language. Any suggestions?",
      "What's your favorite type of cuisine?"
    ]
  },
  {
    id: 'zara',
    name: 'Zara',
    age: 26,
    gender: 'female',
    country: 'India',
    responses: [
      "Namaste! How are you doing today?",
      "I love dancing and music. What about you?",
      "Have you ever tried Indian food? It's amazing!",
      "What kind of hobbies do you enjoy?",
      "I'm a software developer. What do you do?"
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
  const [imagesRemaining, setImagesRemaining] = useState(15); // For standard users
  const [isTyping, setIsTyping] = useState(false);
  const [currentBot, setCurrentBot] = useState(getRandomBot());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [availableBots, setAvailableBots] = useState(botProfiles);

  useEffect(() => {
    const initialMessage: Message = {
      id: 'initial-greeting',
      content: `Hey ${user?.nickname || 'there'}! I'm ${currentBot.name} from ${currentBot.country}. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages([initialMessage]);
  }, [currentBot.name, currentBot.country, user?.nickname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string, isImage = false) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isImage,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (isImage) {
      setImagesRemaining(prev => prev - 1);
    }

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setIsTyping(true);
    }, 1500);

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
    }, 4000);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const switchBot = (botId: string) => {
    const newBot = botProfiles.find(b => b.id === botId);
    if (newBot) {
      setCurrentBot(newBot);
      
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: `You are now chatting with ${newBot.name} from ${newBot.country}.`,
          sender: 'bot',
          timestamp: new Date(),
        }
      ]);
      
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="bg-white border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{currentBot.name}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                Online
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-muted transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            <button 
              className="p-2 rounded-full hover:bg-muted transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="md:hidden bg-white border-b border-border p-2 flex justify-center">
          <button
            className="btn-outline text-xs py-1 px-3 rounded-full flex items-center space-x-1"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <MessageCircle className="h-3 w-3" />
            <span>{isMobileSidebarOpen ? 'Hide' : 'Show'} conversations</span>
          </button>
        </div>

        <div className="flex h-full">
          <div className={`
            md:w-72 bg-white border-r border-border flex flex-col
            ${isMobileSidebarOpen ? 'w-full absolute inset-0 z-10' : 'hidden md:flex'}
          `}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Logo size="sm" />
              <button 
                className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{currentBot.name}</div>
                  <div className="text-xs text-muted-foreground truncate w-36">
                    I'm {currentBot.name}. How can I help...
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Now</div>
              </div>
              
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-2 rounded-lg hover:bg-muted/50 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3">
                    <Image className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Chat {index + 1}</div>
                    <div className="text-xs text-muted-foreground truncate w-36">
                      Last message preview...
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {index === 0 ? '2m' : index === 1 ? '15m' : index === 2 ? '1h' : '2h'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Upgrade to VIP</div>
                  <div className="text-xs text-muted-foreground">Unlock all features</div>
                </div>
                <Button variant="secondary" size="sm">
                  Upgrade
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const nextMessage = messages[index + 1];
                const isLastInGroup = !nextMessage || nextMessage.sender !== message.sender;
                
                return (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    isLastInGroup={isLastInGroup}
                  />
                );
              })}
              
              {isTyping && (
                <div className="flex items-start animate-pulse">
                  <div className="bg-white text-foreground rounded-2xl rounded-bl-none px-4 py-2 shadow-sm inline-flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <MessageInput 
              onSendMessage={handleSendMessage}
              userType="standard"
              imagesRemaining={imagesRemaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
