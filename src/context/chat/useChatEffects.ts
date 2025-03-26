
import { useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { getBlockedUsers, getChatMessages } from '@/services/firebaseService';
import { User } from 'firebase/auth';
import { 
  Bot, 
  botProfiles, 
  sortUsers 
} from './useChatState';
import { Message } from '@/components/chat/MessageBubble';

interface UseChatEffectsParams {
  currentUser: User | null;
  userIsVip: boolean;
  currentBot: Bot;
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  setImagesRemaining: React.Dispatch<React.SetStateAction<number>>;
  setBlockedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  setOnlineUsers: React.Dispatch<React.SetStateAction<Bot[]>>;
  userCountry: string;
  setUserCountry: React.Dispatch<React.SetStateAction<string>>;
  currentBotIdRef: React.MutableRefObject<string>;
  userImagesRemaining?: number;
}

export const useChatEffects = ({
  currentUser,
  userIsVip,
  currentBot,
  setUserChats,
  setImagesRemaining,
  setBlockedUsers,
  setOnlineUsers,
  userCountry,
  setUserCountry,
  currentBotIdRef,
  userImagesRemaining
}: UseChatEffectsParams) => {
  // Update currentBotIdRef when currentBot changes
  useEffect(() => {
    currentBotIdRef.current = currentBot.id;
  }, [currentBot.id, currentBotIdRef]);

  // Fetch blocked users
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (currentUser) {
        try {
          const blocked = await getBlockedUsers();
          setBlockedUsers(blocked);
          
          setOnlineUsers(prev => prev.filter(user => !blocked.includes(user.id)));
        } catch (error) {
          console.error("Error fetching blocked users:", error);
        }
      }
    };
    
    fetchBlockedUsers();
  }, [currentUser, setBlockedUsers, setOnlineUsers]);

  // Listen for real-time chat updates
  useEffect(() => {
    if (!currentUser || !currentBot.id) return;
    
    const chatId = `${currentUser.uid}_${currentBot.id}`;
    const chatRef = ref(rtdb, `chats/${chatId}/messages`);
    
    const handleNewMessages = (snapshot: any) => {
      if (snapshot.exists()) {
        const messages: Message[] = Object.entries(snapshot.val()).map(([id, messageData]: [string, any]) => {
          const content = messageData?.content || '';
          const sender = messageData?.sender || 'system';
          const timestamp = messageData?.timestamp || Date.now();
          const status = messageData?.status || 'sent';
          const isImage = messageData?.isImage || false;
          
          return {
            id,
            content,
            sender: sender as 'user' | 'bot' | 'system',
            timestamp: new Date(timestamp),
            status: status as 'sending' | 'sent' | 'delivered' | 'read',
            isImage
          };
        });
        
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
  }, [currentUser, currentBot.id, setUserChats]);

  // Load chat messages
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!currentUser || !currentBot.id) return;
      
      const chatId = `${currentUser.uid}_${currentBot.id}`;
      
      try {
        const messages = await getChatMessages(chatId);
        
        if (messages.length > 0) {
          const typedMessages: Message[] = messages.map(msg => {
            // Ensure all properties have default values
            return {
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              content: msg.content || '',
              sender: (msg.sender as 'user' | 'bot' | 'system') || 'system',
              timestamp: new Date(msg.timestamp || Date.now()),
              status: ((msg.status || 'sent') as 'sending' | 'sent' | 'delivered' | 'read'),
              isImage: Boolean(msg.isImage)
            };
          });
          
          setUserChats(prev => ({
            ...prev,
            [currentBot.id]: typedMessages
          }));
        } else {
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
      } catch (error) {
        console.error("Error loading chat messages:", error);
      }
    };
    
    loadChatMessages();
  }, [currentBot.id, currentUser, setUserChats]);

  // Update images remaining
  useEffect(() => {
    setImagesRemaining(userIsVip ? Infinity : (userImagesRemaining || 15));
  }, [userIsVip, userImagesRemaining, setImagesRemaining]);

  // Fetch user country
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
  }, [setUserCountry]);

  // Sort users by country
  useEffect(() => {
    if (userCountry) {
      console.log('Sorting users based on country:', userCountry);
      const sortedUsers = sortUsers(botProfiles);
      setOnlineUsers(sortedUsers);
    }
  }, [userCountry, setOnlineUsers]);
};
