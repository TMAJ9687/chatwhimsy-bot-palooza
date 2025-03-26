
import { useCallback } from 'react';
import { User } from 'firebase/auth';
import { FilterState } from '@/components/chat/FilterMenu';
import { Notification } from '@/components/chat/NotificationSidebar';
import { Message } from '@/components/chat/MessageBubble';
import { 
  blockUser, 
  reportUser, 
  sendMessage as fbSendMessage,
  uploadImage as fbUploadImage
} from '@/services/firebaseService';
import { 
  Bot, 
  getRandomBotResponse, 
  botProfiles
} from './useChatState';

interface UseChatActionsParams {
  currentUser: User | null;
  userIsVip: boolean;
  currentBot: Bot;
  filteredUsers: Bot[];
  userChats: Record<string, Message[]>;
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  setTypingBots: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setCurrentBot: React.Dispatch<React.SetStateAction<Bot>>;
  setBlockedUsers: React.Dispatch<React.SetStateAction<string[]>>;
  setOnlineUsers: React.Dispatch<React.SetStateAction<Bot[]>>;
  setImagesRemaining: React.Dispatch<React.SetStateAction<number>>;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setChatHistory: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentBotIdRef: React.MutableRefObject<string>;
}

export const useChatActions = ({
  currentUser,
  userIsVip,
  currentBot,
  filteredUsers,
  userChats,
  setUserChats,
  setTypingBots,
  setCurrentBot,
  setBlockedUsers,
  setOnlineUsers,
  setImagesRemaining,
  setUnreadNotifications,
  setChatHistory,
  currentBotIdRef
}: UseChatActionsParams) => {
  const simulateBotResponse = useCallback((messageId: string, botId: string) => {
    const isVip = userIsVip || currentBot?.vip || false;

    setTypingBots(prev => ({
      ...prev,
      [botId]: true
    }));

    const updateMessageStatus = (status: 'sending' | 'sent' | 'delivered' | 'read') => {
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        const updatedMessages: Message[] = botMessages.map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        );
        return {
          ...prev,
          [botId]: updatedMessages
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
      
      const botResponseContent = getRandomBotResponse(botId);
      
      if (currentUser) {
        const chatId = `${currentUser.uid}_${botId}`;
        fbSendMessage(chatId, {
          content: botResponseContent,
          sender: 'bot',
        }).catch(err => console.error('Error sending bot response:', err));
      }
      
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        
        const updatedMessages: Message[] = isVip ? 
          botMessages.map(msg => 
            msg.sender === 'user' ? { ...msg, status: 'read' } : msg
          ) : botMessages;
        
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
          message: botResponseContent.slice(0, 30) + (botResponseContent.length > 30 ? '...' : ''),
          time: new Date(),
          read: false,
          botId: botId
        };
        
        setUnreadNotifications(prev => [newNotification, ...prev]);
      }
    }, 3000);
  }, [userIsVip, currentUser, currentBot?.vip, currentBotIdRef, setUserChats, setTypingBots, setUnreadNotifications]);

  const handleBlockUser = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      await blockUser(currentUser.uid, currentBot.id);
      
      setBlockedUsers(prev => [...prev, currentBot.id]);
      setOnlineUsers(prev => prev.filter(user => user.id !== currentBot.id));
      
      if (filteredUsers.length > 1) {
        const newUser = filteredUsers.find(user => user.id !== currentBot.id);
        if (newUser) selectUser(newUser);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }, [currentUser, currentBot.id, filteredUsers, setBlockedUsers, setOnlineUsers]);

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
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setUserChats(prev => {
      const currentMessages = prev[currentBotId] || [];
      return {
        ...prev,
        [currentBotId]: [...currentMessages, newMessage]
      };
    });

    try {
      await fbSendMessage(chatId, {
        content: text,
        sender: 'user',
        status: 'sent'
      });
      
      setUserChats(prev => {
        const messages = [...(prev[currentBotId] || [])];
        const updatedMessages = messages.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' as const } : msg
        ) as Message[];
        
        return {
          ...prev,
          [currentBotId]: updatedMessages
        };
      });
    } catch (error) {
      console.error('Error sending message:', error);
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
  }, [currentUser, currentBot.id, currentBot.name, setChatHistory, setUserChats, simulateBotResponse]);

  const handleSendImageMessage = useCallback(async (imageDataUrl: string) => {
    if (!currentUser) return;
    
    const currentBotId = currentBot.id;
    const chatId = `${currentUser.uid}_${currentBotId}`;
    
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
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: imageDataUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isImage: true,
    };
    
    setUserChats(prev => {
      const currentMessages = prev[currentBotId] || [];
      return {
        ...prev,
        [currentBotId]: [...currentMessages, newMessage]
      };
    });

    try {
      const imageUrl = await fbUploadImage(currentUser.uid, file, chatId);
      
      await fbSendMessage(chatId, {
        content: imageUrl,
        sender: 'user',
        isImage: true,
        status: 'sent'
      });
      
      setUserChats(prev => {
        const messages = [...(prev[currentBotId] || [])];
        const updatedMessages: Message[] = messages.map(msg => 
          msg.id === newMessage.id ? { 
            ...msg, 
            content: imageUrl, 
            status: 'sent'
          } : msg
        );
        return {
          ...prev,
          [currentBotId]: updatedMessages
        };
      });
      
      if (!userIsVip) {
        setImagesRemaining(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error sending image:', error);
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
  }, [currentUser, currentBot.id, currentBot.name, userIsVip, setImagesRemaining, setChatHistory, setUserChats, simulateBotResponse]);

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
  }, [currentBot.id, userChats, setCurrentBot, setUserChats]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    // Implementation handled by the parent component via setFilters
  }, []);

  const handleNotificationRead = useCallback((id: string) => {
    setUnreadNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, [setUnreadNotifications]);

  const reportCurrentUser = useCallback(async (reason: string, details?: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      await reportUser(currentUser.uid, currentBot.id, reason, details);
      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      return false;
    }
  }, [currentUser, currentBot.id]);

  return {
    handleBlockUser,
    handleCloseChat,
    handleSendTextMessage,
    handleSendImageMessage,
    selectUser,
    handleFilterChange,
    handleNotificationRead,
    reportCurrentUser
  };
};
