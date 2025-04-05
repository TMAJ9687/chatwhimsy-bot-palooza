
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bot } from '@/types/chat';
import { botProfiles } from '@/data/botProfiles';
import { sortUsers } from '@/utils/botUtils';
import * as adminService from '@/services/admin/adminService';

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
    
    // Update bot's online status in admin tracking
    adminService.trackUserActivity(user.id, true);
  }, []);

  // Set up online users without network requests
  useEffect(() => {
    // Simply set all bots as online - no need for geolocation
    const onlineIds = new Set(sortedBotProfiles.map(bot => bot.id));
    setOnlineUsers(onlineIds);
    
    // Set default country
    setUserCountry('United States');
    
    // Check for rules acceptance in localStorage to persist state
    const hasAcceptedRules = localStorage.getItem('rulesAccepted') === 'true';
    if (hasAcceptedRules) {
      setRulesAccepted(true);
    }
    
    // Register online bots with admin service
    sortedBotProfiles.forEach((bot, index) => {
      // Mark some bots as online for demonstration
      if (index % 2 === 0) {
        adminService.trackUserActivity(bot.id, true);
      }
    });
    
    // Cleanup function to mark bots as offline when leaving
    return () => {
      sortedBotProfiles.forEach(bot => {
        adminService.trackUserActivity(bot.id, false);
      });
    };
  }, [sortedBotProfiles]);

  // Save rules acceptance to localStorage when it changes
  useEffect(() => {
    if (rulesAccepted) {
      localStorage.setItem('rulesAccepted', 'true');
    }
  }, [rulesAccepted]);

  return {
    currentBot,
    onlineUsers: sortedBotProfiles,
    rulesAccepted,
    setRulesAccepted,
    selectUser
  };
};
