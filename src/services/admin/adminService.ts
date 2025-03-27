
import { Bot } from '@/types/chat';
import { botProfiles } from '@/data/botProfiles';
import { AdminAction, BanRecord, ReportFeedback, VipDuration } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const ADMIN_KEY = 'adminData';
const BANNED_USERS_KEY = 'bannedUsers';
const ADMIN_ACTIONS_KEY = 'adminActions';
const BOTS_KEY = 'adminBots';
const REPORT_FEEDBACK_KEY = 'reportFeedback';

// In-memory cache
let botsCache: Bot[] = [];
let bannedCache: BanRecord[] = [];
let actionsCache: AdminAction[] = [];
let reportFeedbackCache: ReportFeedback[] = [];
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
  
  // Load reports and feedback
  const storedReportFeedback = localStorage.getItem(REPORT_FEEDBACK_KEY);
  reportFeedbackCache = storedReportFeedback ? JSON.parse(storedReportFeedback) : [];
  
  // Clean up expired reports and feedback
  cleanupExpiredReportsFeedback();
  
  initialized = true;
  
  // Save initialized data back to localStorage
  saveToLocalStorage();
};

// Save all data to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem(BOTS_KEY, JSON.stringify(botsCache));
  localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(bannedCache));
  localStorage.setItem(ADMIN_ACTIONS_KEY, JSON.stringify(actionsCache));
  localStorage.setItem(REPORT_FEEDBACK_KEY, JSON.stringify(reportFeedbackCache));
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
  } else if (duration === '7 Days' || duration === '1 Week') {
    return new Date(now.setDate(now.getDate() + 7));
  } else if (duration === '30 Days' || duration === '1 Month') {
    return new Date(now.setDate(now.getDate() + 30));
  } else if (duration === '1 Year') {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  }
  
  return new Date(now.setDate(now.getDate() + 1)); // Default to 1 day
}

// Report and Feedback Management
export const addReportOrFeedback = (
  type: 'report' | 'feedback', 
  userId: string, 
  content: string
): ReportFeedback => {
  initializeAdminService();
  
  // Create timestamp for now
  const now = new Date();
  
  // Create expiry date (24 hours from now)
  const expiresAt = new Date(now);
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  const item: ReportFeedback = {
    id: uuidv4(),
    type,
    userId,
    content,
    timestamp: now,
    expiresAt,
    resolved: false
  };
  
  reportFeedbackCache.push(item);
  saveToLocalStorage();
  
  return item;
};

export const getReportsAndFeedback = (): ReportFeedback[] => {
  initializeAdminService();
  // Clean up expired items before returning
  cleanupExpiredReportsFeedback();
  return [...reportFeedbackCache];
};

export const resolveReportOrFeedback = (id: string): boolean => {
  initializeAdminService();
  const item = reportFeedbackCache.find(item => item.id === id);
  if (!item) return false;
  
  item.resolved = true;
  saveToLocalStorage();
  return true;
};

export const deleteReportOrFeedback = (id: string): boolean => {
  initializeAdminService();
  const initialLength = reportFeedbackCache.length;
  reportFeedbackCache = reportFeedbackCache.filter(item => item.id !== id);
  
  const deleted = initialLength > reportFeedbackCache.length;
  if (deleted) {
    saveToLocalStorage();
  }
  
  return deleted;
};

export const cleanupExpiredReportsFeedback = (): void => {
  const now = new Date();
  const initialLength = reportFeedbackCache.length;
  
  reportFeedbackCache = reportFeedbackCache.filter(item => {
    return new Date(item.expiresAt) > now;
  });
  
  if (initialLength > reportFeedbackCache.length) {
    saveToLocalStorage();
  }
};

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

export const adminLogout = (): void => {
  // Clear admin session
  localStorage.removeItem(ADMIN_KEY);
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

export const upgradeToVIP = (
  userId: string, 
  adminId: string, 
  duration: VipDuration = 'Lifetime'
): void => {
  // In a real application, this would update the user's status in a database
  
  // Log the action
  logAdminAction({
    id: uuidv4(),
    actionType: 'upgrade',
    targetId: userId,
    targetType: 'user',
    duration: duration,
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
