
import { useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useChatMessageState } from './chat/useChatMessageState';
import { useChatHistorySaver } from './chat/useChatHistorySaver';
import { useChatHistoryLoader } from './chat/useChatHistoryLoader';
import { useChatMessageHandlers } from './chat/useChatMessageHandlers';
import { useBotResponses } from './chat/useBotResponses';
import { useChatInitializer } from './chat/useChatInitializer';

export const useChatMessages = (isVip: boolean, onNewNotification: (botId: string, content: string, botName: string) => void) => {
  const { user } = useUser();
  const {
    userChats,
    typingBots,
    imagesRemaining,
    currentBotIdRef,
    chatHistoryLoadedRef,
    saveTimeoutRef,
    setUserChats,
    setTypingBots,
    setImagesRemaining,
    setCurrentBotId
  } = useChatMessageState();

  const { saveChatHistoryDebounced } = useChatHistorySaver(
    isVip,
    user?.id,
    userChats,
    saveTimeoutRef
  );

  const { loadChatHistory } = useChatHistoryLoader(
    isVip,
    user?.id,
    chatHistoryLoadedRef
  );

  const { handleSendTextMessage, handleSendImageMessage, handleSendVoiceMessage } = useChatMessageHandlers(
    userChats,
    setUserChats,
    setImagesRemaining,
    isVip,
    user?.id,
    saveChatHistoryDebounced
  );

  const { simulateBotResponse } = useBotResponses(
    setUserChats,
    setTypingBots,
    currentBotIdRef,
    isVip,
    user?.id,
    saveChatHistoryDebounced
  );

  const { initializeChat, initializeImageRemaining } = useChatInitializer(
    userChats,
    setUserChats,
    setImagesRemaining,
    loadChatHistory,
    isVip
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all save timeouts
      Object.values(saveTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  return {
    userChats,
    typingBots,
    imagesRemaining,
    setUserChats,
    setCurrentBotId,
    initializeChat,
    simulateBotResponse: (messageId: string, botId: string) => 
      simulateBotResponse(messageId, botId, onNewNotification),
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    initializeImageRemaining
  };
};
