
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
  const [userCountry, setUserCountry] = useState<string>('');

  // Sort bot profiles once and memoize to avoid re-sorting
  const sortedBotProfiles = useMemo(() => sortUsers(botProfiles), []);

  // Select a user to chat with
  const selectUser = useCallback((user: Bot) => {
    setCurrentBot(user);
  }, []);

  // Fetch user country on mount
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        // Use the reliable ipapi.co service directly instead of the failing ipgeolocation service
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(`Country detection failed: ${response.status}`);
        }
        
        const data = await response.json();
        setUserCountry(data.country_name || '');
        
        // Special case handling for Israel/Palestine
        if (data.country_name && data.country_name.toLowerCase() === 'israel') {
          setUserCountry('Palestine');
        }
      } catch (error) {
        console.error('Error fetching user country:', error);
        // Set a default country if detection fails
        setUserCountry('United States');
      }
    };

    fetchUserCountry();
  }, []);

  // Update online users when user country changes - only once
  useEffect(() => {
    if (userCountry) {
      // Remove the console.log to reduce noise
      setOnlineUsers(new Set(sortedBotProfiles.map(bot => bot.id)));
    }
  }, [userCountry, sortedBotProfiles]);

  return {
    currentBot,
    onlineUsers: sortedBotProfiles,
    rulesAccepted,
    setRulesAccepted,
    selectUser
  };
};
