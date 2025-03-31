import { Bot } from '@/types/chat';

// Default generic responses when bot-specific responses aren't available
const DEFAULT_BOT_RESPONSES = [
  "Hello! How are you today?",
  "I'd love to chat more about that!",
  "That's interesting. Tell me more.",
  "Great to hear from you!",
  "Thanks for sharing that with me.",
  "What else would you like to talk about?"
];

export const getRandomBotResponse = (botId: string): string => {
  // For now, just return a random response from the default list
  // This can be enhanced to include bot-specific responses later
  return DEFAULT_BOT_RESPONSES[Math.floor(Math.random() * DEFAULT_BOT_RESPONSES.length)];
};

// Get a random response from a specific bot
export const getBotRandomResponse = (bot: Bot): string => {
  if (bot.responses && bot.responses.length > 0) {
    return bot.responses[Math.floor(Math.random() * bot.responses.length)];
  }
  return DEFAULT_BOT_RESPONSES[Math.floor(Math.random() * DEFAULT_BOT_RESPONSES.length)];
};

// Other bot utility functions can be added here
