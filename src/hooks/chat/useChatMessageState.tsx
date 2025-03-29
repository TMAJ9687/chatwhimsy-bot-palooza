
import { useState, useRef } from 'react';
import { Message } from '@/types/chat';

export const useChatMessageState = () => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [imagesRemaining, setImagesRemaining] = useState(15);
  const currentBotIdRef = useRef<string>('');
  const chatHistoryLoadedRef = useRef<Set<string>>(new Set());
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout | null>>({});

  const setCurrentBotId = (botId: string) => {
    currentBotIdRef.current = botId;
  };

  return {
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
  };
};
