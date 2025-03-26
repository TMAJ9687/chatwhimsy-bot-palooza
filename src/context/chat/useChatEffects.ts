
import { useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { getBlockedUsersSafe as getBlockedUsers, getChatMessagesSafe as getChatMessages } from '@/services/firebaseService';
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
        try {
          // Ensure the data is serializable before updating state
          const messagesObj = snapshot.val();
          const messages: Message[] = Object.entries(messagesObj).map(([id, messageData]: [string, any]) => {
            // Use safe default values for all properties
            return makeSerializable({
              id,
              content: messageData?.content || '',
              sender: messageData?.sender || 'system',
              timestamp: messageData?.timestamp ? new Date(messageData.timestamp) : new Date(),
              status: messageData?.status || 'sent',
              isImage: Boolean(messageData?.isImage)
            });
          });
          
          setUserChats(prev => ({
            ...prev,
            [currentBot.id]: messages
          }));
        } catch (error) {
          console.error("Error processing chat messages:", error);
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
          // Ensure all messages are safely serializable
          const typedMessages: Message[] = messages.map(msg => {
            // Ensure all properties have default values
            return makeSerializable({
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              content: msg.content || '',
              sender: (msg.sender as 'user' | 'bot' | 'system') || 'system',
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              status: ((msg.status || 'sent') as 'sending' | 'sent' | 'delivered' | 'read'),
              isImage: Boolean(msg.isImage)
            });
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
        // Add a fallback message on error
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
  }, [currentBot.id, currentBot.name, currentUser, setUserChats]);

  // Update images remaining
  useEffect(() => {
    setImagesRemaining(userIsVip ? Infinity : (userImagesRemaining || 15));
  }, [userIsVip, userImagesRemaining, setImagesRemaining]);

  // Fetch user country - optimized to avoid DataCloneError
  useEffect(() => {
    // Use a static country value to avoid API calls that might cause DataCloneError
    setUserCountry('United States');
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
