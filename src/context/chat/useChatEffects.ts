
import { useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { 
  getBlockedUsersSafe as getBlockedUsers, 
  getChatMessagesSafe as getChatMessages 
} from '@/services/firebaseService';
import { User } from 'firebase/auth';
import { 
  Bot, 
  botProfiles, 
  sortUsers 
} from './useChatState';
import { Message } from '@/components/chat/MessageBubble';
import { makeSerializable } from '@/utils/serialization';

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
          
          // Ensure the result is serializable
          const safeBlocked = makeSerializable(blocked || []);
          setBlockedUsers(safeBlocked);
          
          setOnlineUsers(prev => {
            // Create a safe copy of prev first
            const safePrev = makeSerializable([...prev]);
            return safePrev.filter(user => !safeBlocked.includes(user.id));
          });
        } catch (error) {
          console.error("Error fetching blocked users:", error);
          // Set default values on error
          setBlockedUsers([]);
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
        try {
          // Get data and ensure it's serializable
          const messagesObj = makeSerializable(snapshot.val() || {});
          
          // Convert to array of messages with default values
          const messages: Message[] = Object.entries(messagesObj).map(([id, messageData]: [string, any]) => {
            return {
              id,
              content: messageData?.content || '',
              sender: messageData?.sender || 'system',
              timestamp: messageData?.timestamp 
                ? new Date(messageData.timestamp) 
                : new Date(),
              status: messageData?.status || 'sent',
              isImage: Boolean(messageData?.isImage)
            };
          });
          
          // Update state with serializable data
          setUserChats(prev => {
            const safePrev = {...prev};
            return {
              ...safePrev,
              [currentBot.id]: messages
            };
          });
        } catch (error) {
          console.error("Error processing chat messages:", error);
          // Don't update state on error
        }
      }
    };
    
    try {
      onValue(chatRef, handleNewMessages);
    } catch (error) {
      console.error("Error setting up chat listener:", error);
    }
    
    return () => {
      try {
        off(chatRef, 'value', handleNewMessages);
      } catch (error) {
        console.error("Error removing chat listener:", error);
      }
    };
  }, [currentUser, currentBot.id, setUserChats]);

  // Load chat messages
  useEffect(() => {
    const loadChatMessages = async () => {
      if (!currentUser || !currentBot.id) return;
      
      const chatId = `${currentUser.uid}_${currentBot.id}`;
      
      try {
        const messages = await getChatMessages(chatId);
        
        if (messages && messages.length > 0) {
          // Create serializable messages with default values
          const typedMessages: Message[] = messages.map(msg => {
            const timestamp = msg.timestamp 
              ? (msg.timestamp instanceof Date 
                ? msg.timestamp 
                : new Date(msg.timestamp as string | number))
              : new Date();
              
            return {
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              content: msg.content || '',
              sender: (msg.sender as 'user' | 'bot' | 'system') || 'system',
              timestamp,
              status: ((msg.status || 'sent') as 'sending' | 'sent' | 'delivered' | 'read'),
              isImage: Boolean(msg.isImage)
            };
          });
          
          setUserChats(prev => {
            const safePrev = {...prev};
            return {
              ...safePrev,
              [currentBot.id]: typedMessages
            };
          });
        } else {
          // Create default welcome message
          setUserChats(prev => {
            const safePrev = {...prev};
            return {
              ...safePrev,
              [currentBot.id]: [{
                id: `system-${Date.now()}`,
                content: `Start a conversation with ${currentBot.name}`,
                sender: 'system',
                timestamp: new Date(),
              }]
            };
          });
        }
      } catch (error) {
        console.error("Error loading chat messages:", error);
        // Add a fallback message on error
        setUserChats(prev => {
          const safePrev = {...prev};
          return {
            ...safePrev,
            [currentBot.id]: [{
              id: `system-${Date.now()}`,
              content: `Start a conversation with ${currentBot.name}`,
              sender: 'system',
              timestamp: new Date(),
            }]
          };
        });
      }
    };
    
    loadChatMessages();
  }, [currentBot.id, currentBot.name, currentUser, setUserChats]);

  // Update images remaining
  useEffect(() => {
    const imagesCount = userIsVip ? Infinity : (userImagesRemaining || 15);
    setImagesRemaining(imagesCount);
  }, [userIsVip, userImagesRemaining, setImagesRemaining]);

  // Simplified country detection to avoid API calls
  useEffect(() => {
    setUserCountry('United States');
  }, [setUserCountry]);

  // Sort users by country - make sure it's serializable
  useEffect(() => {
    if (userCountry) {
      console.log('Sorting users based on country:', userCountry);
      try {
        const sortedUsers = sortUsers(makeSerializable(botProfiles));
        setOnlineUsers(sortedUsers);
      } catch (error) {
        console.error("Error sorting users:", error);
        setOnlineUsers(botProfiles);
      }
    }
  }, [userCountry, setOnlineUsers]);
};
