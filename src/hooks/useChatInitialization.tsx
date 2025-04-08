
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const registeredBotsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const trackingAttemptedRef = useRef(false);

  // Sort bot profiles once and memoize to avoid re-sorting
  const sortedBotProfiles = useMemo(() => sortUsers(botProfiles), []);

  // Select a user to chat with
  const selectUser = useCallback((user: Bot) => {
    setCurrentBot(user);
  }, []);

  // Set up online users without network requests - with memory leak prevention
  useEffect(() => {
    if (isInitializedRef.current) return; // Only run once
    isInitializedRef.current = true;
    
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
    
    // Only register a bot with admin service if we haven't already tried
    // This prevents excessive tracking attempts
    if (!trackingAttemptedRef.current && sortedBotProfiles.length > 0) {
      trackingAttemptedRef.current = true;
      
      // Randomly select one bot to track (to distribute tracking load)
      const botIndex = Math.floor(Math.random() * sortedBotProfiles.length);
      const botToTrack = sortedBotProfiles[botIndex];
      
      if (botToTrack && !registeredBotsRef.current.has(botToTrack.id)) {
        // Use timeout to delay this non-critical operation
        setTimeout(() => {
          try {
            adminService.trackUserActivity(botToTrack.id, true);
            registeredBotsRef.current.add(botToTrack.id);
          } catch (e) {
            // Silently fail - this is just tracking
          }
        }, 2000);
      }
    }
    
    // Return cleanup function
    return () => {
      // Clear local state on unmount
      registeredBotsRef.current.clear();
      isInitializedRef.current = false;
      trackingAttemptedRef.current = false;
    };
  }, []); // Empty dependencies to run once

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
