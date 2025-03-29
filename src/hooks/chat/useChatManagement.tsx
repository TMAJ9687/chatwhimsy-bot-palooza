
import { useCallback } from 'react';
import { Bot } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export const useChatManagement = (
  currentBot: Bot,
  filteredUsers: Bot[],
  blockedUsers: Set<string>,
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, any[]>>>,
  selectUser: (user: Bot) => void,
  initializeChat: (botId: string, botName: string) => Promise<void>
) => {
  const { toast } = useToast();

  const handleCloseChat = useCallback(() => {
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, selectUser]);

  const selectUserWithChat = useCallback((user: Bot) => {
    if (user.id !== currentBot.id) {
      selectUser(user);
      initializeChat(user.id, user.name);
    }
  }, [currentBot.id, selectUser, initializeChat]);

  const handleDeleteConversation = useCallback((userId: string) => {
    setUserChats(prev => {
      if (!prev[userId]) return prev;
      
      const newChats = { ...prev };
      delete newChats[userId];
      return newChats;
    });
    
    toast({
      title: "Conversation deleted",
      description: `Your conversation has been deleted.`,
    });
    
    if (userId === currentBot.id) {
      initializeChat(currentBot.id, currentBot.name);
    }
  }, [currentBot.id, currentBot.name, initializeChat, toast, setUserChats]);

  const handleBlockUser = useCallback((userId: string, blockUser: (userId: string) => void) => {
    blockUser(userId);
    
    if (userId === currentBot.id && filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== userId && !blockedUsers.has(user.id));
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, blockedUsers, selectUser]);

  const getSharedMedia = useCallback((userId: string, userChats: Record<string, any[]>) => {
    const chatMessages = userChats[userId] || [];
    
    const images = chatMessages.filter(msg => msg.isImage);
    const voice = chatMessages.filter(msg => msg.isVoice);
    
    return { images, voice };
  }, []);

  return {
    handleCloseChat,
    selectUserWithChat,
    handleDeleteConversation,
    handleBlockUser,
    getSharedMedia
  };
};
