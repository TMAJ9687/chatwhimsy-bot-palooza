
import { useState, useEffect, useCallback } from 'react';
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

  // Sort bot profiles once
  const sortedBotProfiles = sortUsers(botProfiles);

  // Select a user to chat with
  const selectUser = useCallback((user: Bot) => {
    setCurrentBot(user);
  }, []);

  // Fetch user country on mount
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
  }, []);

  // Update sorted users when user country changes
  useEffect(() => {
    if (userCountry) {
      console.log('Sorting users based on country:', userCountry);
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
