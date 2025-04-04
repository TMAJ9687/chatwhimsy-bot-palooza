
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bot } from '@/types/chat';
import { botProfiles } from '@/data/botProfiles';
import { sortUsers } from '@/utils/botUtils';

export const useChatInitialization = () => {
  // Default bot from profiles
  const defaultBot = botProfiles[0];
  
  // State for managing current bot and online users
  const [currentBot, setCurrentBot] = useState<Bot>(defaultBot);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('United States');

  // Sort bot profiles once and memoize to avoid re-sorting
  const sortedBotProfiles = useMemo(() => sortUsers(botProfiles), []);

  // Select a user to chat with
  const selectUser = useCallback((user: Bot) => {
    setCurrentBot(user);
  }, []);

  // Set up online users without network requests
  useEffect(() => {
    // Simply set all bots as online - no need for geolocation
    setOnlineUsers(new Set(sortedBotProfiles.map(bot => bot.id)));
    
    // Set default country
    setUserCountry('United States');
  }, [sortedBotProfiles]);

  return {
    currentBot,
    onlineUsers: sortedBotProfiles,
    rulesAccepted,
    setRulesAccepted,
    selectUser
  };
};
