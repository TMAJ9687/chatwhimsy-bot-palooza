
import { Bot } from '@/types/chat';

/**
 * Get a random response for a bot
 */
export const getRandomBotResponse = (bot: Bot): string => {
  if (!bot.responses || bot.responses.length === 0) {
    return "Hello! How are you today?";
  }
  
  const randomIndex = Math.floor(Math.random() * bot.responses.length);
  return bot.responses[randomIndex];
};

/**
 * Sort bot users by online status, unread messages, lastSeen
 */
export const sortUsers = (users: Bot[]): Bot[] => {
  return [...users].sort((a, b) => {
    // First sort by online status
    if (a.online && !b.online) return -1;
    if (!a.online && b.online) return 1;
    
    // Then by message count (if available)
    if (a.messageCount && b.messageCount) {
      if (a.messageCount > b.messageCount) return -1;
      if (a.messageCount < b.messageCount) return 1;
    }
    
    // Then by last seen (most recent first)
    if (a.lastSeen && b.lastSeen) {
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    }
    
    // Fallback to alphabetical order
    return a.name.localeCompare(b.name);
  });
};

/**
 * Filter bots by criteria
 */
export const filterBots = (bots: Bot[], criteria: {
  searchTerm?: string;
  gender?: string[];
  country?: string[];
  ageRange?: [number, number];
  vipOnly?: boolean;
}): Bot[] => {
  return bots.filter(bot => {
    // Filter by search term
    if (criteria.searchTerm && !bot.name.toLowerCase().includes(criteria.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by gender
    if (criteria.gender && criteria.gender.length > 0 && !criteria.gender.includes(bot.gender)) {
      return false;
    }
    
    // Filter by country
    if (criteria.country && criteria.country.length > 0 && !criteria.country.includes(bot.country)) {
      return false;
    }
    
    // Filter by age range
    if (criteria.ageRange && (bot.age < criteria.ageRange[0] || bot.age > criteria.ageRange[1])) {
      return false;
    }
    
    // Filter by VIP status
    if (criteria.vipOnly && !bot.vip) {
      return false;
    }
    
    return true;
  });
};
