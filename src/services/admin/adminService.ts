
import { Bot } from '@/types/chat';
import { botProfiles } from '@/data/botProfiles';
import { AdminAction, BanRecord } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const ADMIN_KEY = 'adminData';
const BANNED_USERS_KEY = 'bannedUsers';
const ADMIN_ACTIONS_KEY = 'adminActions';
const BOTS_KEY = 'adminBots';

// In-memory cache
let botsCache: Bot[] = [];
let bannedCache: BanRecord[] = [];
let actionsCache: AdminAction[] = [];
let initialized = false;

// Initialize by loading data from localStorage or using defaults
export const initializeAdminService = () => {
  if (initialized) return;
  
  // Try to load bots from localStorage, if not present use botProfiles
  const storedBots = localStorage.getItem(BOTS_KEY);
  botsCache = storedBots ? JSON.parse(storedBots) : [...botProfiles];
  
  // Load banned users
  const storedBanned = localStorage.getItem(BANNED_USERS_KEY);
  bannedCache = storedBanned ? JSON.parse(storedBanned) : [];
  
  // Load admin actions
  const storedActions = localStorage.getItem(ADMIN_ACTIONS_KEY);
  actionsCache = storedActions ? JSON.parse(storedActions) : [];
  
  initialized = true;
  
  // Save initialized data back to localStorage
  saveToLocalStorage();
};

// Save all data to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem(BOTS_KEY, JSON.stringify(botsCache));
  localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(bannedCache));
  localStorage.setItem(ADMIN_ACTIONS_KEY, JSON.stringify(actionsCache));
};

// Bot Management
export const getAllBots = (): Bot[] => {
  initializeAdminService();
  return [...botsCache];
};

export const getBot = (id: string): Bot | undefined => {
  initializeAdminService();
  return botsCache.find(bot => bot.id === id);
};

export const createBot = (bot: Omit<Bot, 'id'>): Bot => {
  initializeAdminService();
  const newBot: Bot = {
    ...bot,
    id: `bot-${uuidv4().slice(0, 8)}`
  };
  
  botsCache.push(newBot);
  saveToLocalStorage();
  return newBot;
};

export const updateBot = (id: string, updates: Partial<Bot>): Bot | null => {
  initializeAdminService();
  const index = botsCache.findIndex(bot => bot.id === id);
  if (index === -1) return null;
  
  botsCache[index] = { ...botsCache[index], ...updates };
  saveToLocalStorage();
  return botsCache[index];
};

export const deleteBot = (id: string): boolean => {
  initializeAdminService();
  const initialLength = botsCache.length;
  botsCache = botsCache.filter(bot => bot.id !== id);
  
  // Check if a bot was removed
  const botRemoved = initialLength > botsCache.length;
  if (botRemoved) {
    saveToLocalStorage();
  }
  
  return botRemoved;
};

// Ban Management
export const getBannedUsers = (): BanRecord[] => {
  initializeAdminService();
  return [...bannedCache];
};

export const banUser = (banRecord: Omit<BanRecord, 'id' | 'timestamp'>): BanRecord => {
  initializeAdminService();
  
  // Create a new ban record
  const newBan: BanRecord = {
    ...banRecord,
    id: uuidv4(),
    timestamp: new Date(),
    expiresAt: banRecord.duration !== 'Permanent' ? 
      calculateExpiryDate(banRecord.duration) : undefined
  };
  
  bannedCache.push(newBan);
  
  // Log admin action
  logAdminAction({
    id: uuidv4(),
    actionType: 'ban',
    targetId: banRecord.identifier,
    targetType: banRecord.identifierType,
    reason: banRecord.reason,
    duration: banRecord.duration,
    timestamp: new Date(),
    adminId: banRecord.adminId
  });
  
  saveToLocalStorage();
  return newBan;
};

export const unbanUser = (id: string, adminId: string): boolean => {
  initializeAdminService();
  const banRecord = bannedCache.find(ban => ban.id === id);
  if (!banRecord) return false;
  
  bannedCache = bannedCache.filter(ban => ban.id !== id);
  
  // Log admin action
  logAdminAction({
    id: uuidv4(),
    actionType: 'unban',
    targetId: banRecord.identifier,
    targetType: banRecord.identifierType,
    timestamp: new Date(),
    adminId: adminId
  });
  
  saveToLocalStorage();
  return true;
};

export const isUserBanned = (identifier: string): BanRecord | null => {
  initializeAdminService();
  const ban = bannedCache.find(ban => ban.identifier === identifier);
  
  if (!ban) return null;
  
  // Check if ban has expired
  if (ban.expiresAt && new Date() > new Date(ban.expiresAt)) {
    // Remove expired ban
    bannedCache = bannedCache.filter(b => b.id !== ban.id);
    saveToLocalStorage();
    return null;
  }
  
  return ban;
};

// Admin Actions Logging
export const getAdminActions = (): AdminAction[] => {
  initializeAdminService();
  return [...actionsCache];
};

export const logAdminAction = (action: AdminAction): void => {
  initializeAdminService();
  actionsCache.push(action);
  saveToLocalStorage();
};

// Helper functions
function calculateExpiryDate(duration: string): Date {
  const now = new Date();
  
  if (duration === '1 Day') {
    return new Date(now.setDate(now.getDate() + 1));
  } else if (duration === '3 Days') {
    return new Date(now.setDate(now.getDate() + 3));
  } else if (duration === '7 Days') {
    return new Date(now.setDate(now.getDate() + 7));
  } else if (duration === '30 Days') {
    return new Date(now.setDate(now.getDate() + 30));
  }
  
  return new Date(now.setDate(now.getDate() + 1)); // Default to 1 day
}

// Admin Authentication
export const verifyAdminCredentials = (email: string, password: string): boolean => {
  // For demo purposes, hardcoded credentials
  return email === 'admin@example.com' && password === 'admin123';
};

export const setAdminLoggedIn = (isLoggedIn: boolean): void => {
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ authenticated: isLoggedIn }));
};

export const isAdminLoggedIn = (): boolean => {
  const adminData = localStorage.getItem(ADMIN_KEY);
  if (!adminData) return false;
  
  try {
    const data = JSON.parse(adminData);
    return data.authenticated === true;
  } catch {
    return false;
  }
};

// User Management (for Standard/VIP users)
export const kickUser = (userId: string, adminId: string): void => {
  // In a real application, this would interact with a backend service
  // to force disconnect a user from the chat
  
  // Log the action
  logAdminAction({
    id: uuidv4(),
    actionType: 'kick',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  });
  
  saveToLocalStorage();
};

export const upgradeToVIP = (userId: string, adminId: string): void => {
  // In a real application, this would update the user's status in a database
  
  // Log the action
  logAdminAction({
    id: uuidv4(),
    actionType: 'upgrade',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  });
  
  saveToLocalStorage();
};

export const downgradeToStandard = (userId: string, adminId: string): void => {
  // In a real application, this would update the user's status in a database
  
  // Log the action
  logAdminAction({
    id: uuidv4(),
    actionType: 'downgrade',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  });
  
  saveToLocalStorage();
};
