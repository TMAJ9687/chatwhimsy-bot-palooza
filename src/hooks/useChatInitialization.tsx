
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
  
  // Track which bots we've already registered to avoid duplicate tracking
  const [registeredBots, setRegisteredBots] = useState<Set<string>>(new Set());

  // Sort bot profiles once and memoize to avoid re-sorting
  const sortedBotProfiles = useMemo(() => sortUsers(botProfiles), []);

  // Select a user to chat with
  const selectUser = useCallback((user: Bot) => {
    setCurrentBot(user);
  }, []);

  // Set up online users without network requests - with memory leak prevention
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
    
    // Register online bots with admin service - but only once and only some bots
    // to prevent memory leaks
    const botsToRegister = new Set<string>();
    
    sortedBotProfiles.forEach((bot, index) => {
      // Mark only some bots as online for demonstration (every other bot)
      if (index % 2 === 0 && !registeredBots.has(bot.id)) {
        botsToRegister.add(bot.id);
      }
    });
    
    // Only register bots we haven't registered yet
    if (botsToRegister.size > 0) {
      botsToRegister.forEach(botId => {
        adminService.trackUserActivity(botId, true);
      });
      
      // Remember which bots we've registered
      setRegisteredBots(prev => {
        const updated = new Set(prev);
        botsToRegister.forEach(id => updated.add(id));
        return updated;
      });
    }
    
    // No cleanup function needed - the admin components will handle cleanup
    // This prevents double cleanup and potential memory leaks
  }, [sortedBotProfiles, registeredBots]);

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
