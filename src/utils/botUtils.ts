
import { Bot } from '../types/chat';
import { botProfiles } from '../data/botProfiles';

export const getRandomBot = (): Bot => {
  return botProfiles[Math.floor(Math.random() * botProfiles.length)];
};

export const getRandomBotResponse = (botId: string): string => {
  const bot = botProfiles.find(b => b.id === botId);
  if (!bot) return "Hello there!";
  return bot.responses[Math.floor(Math.random() * bot.responses.length)];
};

export const sortUsers = (users: Bot[]): Bot[] => {
  return [...users].sort((a, b) => {
    if (a.vip && !b.vip) return -1;
    if (!a.vip && b.vip) return 1;
    
    if (a.country !== b.country) {
      return a.country.localeCompare(b.country);
    }
    
    return a.name.localeCompare(b.name);
  });
};
