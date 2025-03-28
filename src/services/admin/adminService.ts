import { Bot } from '@/types/chat';
import { botProfiles } from '@/data/botProfiles';
import { AdminAction, BanRecord, ReportFeedback, VipDuration } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { createStorageBatcher } from '@/utils/adminUtils';
import { storageWorker } from '@/utils/storageWorkerManager';

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

// Initialize the storage batcher
const storageBatcher = createStorageBatcher();

// Initialize by loading data from localStorage or using defaults
export const initializeAdminService = async () => {
  if (initialized) return;
  
  console.time('adminServiceInit');
  
  // Try to load bots from localStorage using the worker
  try {
    // Load data asynchronously to prevent main thread blocking
    const [storedBots, storedBanned, storedActions, storedReportFeedback] = await Promise.all([
      storageWorker.load(BOTS_KEY),
      storageWorker.load(BANNED_USERS_KEY),
      storageWorker.load(ADMIN_ACTIONS_KEY),
      storageWorker.load(REPORT_FEEDBACK_KEY)
    ]);
    
    // Set caches with loaded data or defaults
    botsCache = storedBots || [...botProfiles];
    bannedCache = storedBanned || [];
    actionsCache = storedActions || [];
    reportFeedbackCache = storedReportFeedback || [];
  } catch (error) {
    console.error('Error loading admin data:', error);
    // Use defaults if loading fails
    botsCache = [...botProfiles];
    bannedCache = [];
    actionsCache = [];
    reportFeedbackCache = [];
  }
  
  // Clean up expired reports and feedback
  cleanupExpiredReportsFeedback();
  
  initialized = true;
  console.timeEnd('adminServiceInit');
};

// Save data to localStorage using the batcher
const saveToLocalStorage = () => {
  storageBatcher.queueItem(BOTS_KEY, botsCache);
  storageBatcher.queueItem(BANNED_USERS_KEY, bannedCache);
  storageBatcher.queueItem(ADMIN_ACTIONS_KEY, actionsCache);
  storageBatcher.queueItem(REPORT_FEEDBACK_KEY, reportFeedbackCache);
};

// Force immediate save (for critical operations)
const forceSave = async () => {
  await storageBatcher.flush();
};

// Bot Management
export const getAllBots = (): Bot[] => {
  if (!initialized) {
    // Initialize synchronously if needed
    initializeAdminService();
  }
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
  const action = logAdminAction({
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

export const logAdminAction = (action: AdminAction): AdminAction => {
  initializeAdminService();
  actionsCache.push(action);
  saveToLocalStorage();
  return action;
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
  if (!initialized) {
    initializeAdminService();
  }
  
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

export const setAdminLoggedIn = async (isLoggedIn: boolean): Promise<void> => {
  // Use direct worker save for critical operations
  await storageWorker.save(ADMIN_KEY, { authenticated: isLoggedIn });
  
  if (isLoggedIn) {
    // Force immediate save for login state
    await forceSave();
  }
};

export const isAdminLoggedIn = async (): Promise<boolean> => {
  try {
    const adminData = await storageWorker.load(ADMIN_KEY);
    return adminData?.authenticated === true;
  } catch {
    return false;
  }
};

// Synchronous version for immediate UI needs (uses cached result if possible)
export const isAdminLoggedInSync = (): boolean => {
  try {
    const adminData = localStorage.getItem(ADMIN_KEY);
    if (!adminData) return false;
    
    const data = JSON.parse(adminData);
    return data.authenticated === true;
  } catch {
    return false;
  }
};

export const adminLogout = async (): Promise<void> => {
  // Clear admin session
  await storageWorker.delete(ADMIN_KEY);
  // Force immediate save
  await forceSave();
};

// User Management (for Standard/VIP users)
export const kickUser = (userId: string, adminId: string): AdminAction => {
  // In a real application, this would interact with a backend service
  // to force disconnect a user from the chat
  
  // Log the action
  const action = logAdminAction({
    id: uuidv4(),
    actionType: 'kick',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  });
  
  return action;
};

export const upgradeToVIP = (
  userId: string, 
  adminId: string, 
  duration: VipDuration = 'Lifetime'
): AdminAction => {
  // In a real application, this would update the user's status in a database
  
  // Log the action
  const action = logAdminAction({
    id: uuidv4(),
    actionType: 'upgrade',
    targetId: userId,
    targetType: 'user',
    duration: duration,
    timestamp: new Date(),
    adminId: adminId
  });
  
  return action;
};

export const downgradeToStandard = (userId: string, adminId: string): AdminAction => {
  // In a real application, this would update the user's status in a database
  
  // Log the action
  const action = logAdminAction({
    id: uuidv4(),
    actionType: 'downgrade',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  });
  
  return action;
};
