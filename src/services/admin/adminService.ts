import { Bot } from '@/types/chat';
import { AdminAction, BanRecord, ReportFeedback, VipDuration } from '@/types/admin';
import * as firebaseAuth from '@/firebase/auth';
import * as firestoreService from '@/firebase/firestore';

// Initialize the admin service
export const initializeAdminService = async (): Promise<void> => {
  console.time('adminServiceInit');
  
  // Initialize Firestore with default data if needed
  await firestoreService.initializeFirestoreData();
  
  console.timeEnd('adminServiceInit');
};

// Bot Management
export const getAllBots = async (): Promise<Bot[]> => {
  return await firestoreService.getAllBots();
};

export const getBot = async (id: string): Promise<Bot | undefined> => {
  return await firestoreService.getBot(id);
};

export const createBot = async (bot: Omit<Bot, 'id'>): Promise<Bot> => {
  return await firestoreService.createBot(bot);
};

export const updateBot = async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
  return await firestoreService.updateBot(id, updates);
};

export const deleteBot = async (id: string): Promise<boolean> => {
  return await firestoreService.deleteBot(id);
};

// Ban Management
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  return await firestoreService.getBannedUsers();
};

export const banUser = async (banRecord: Omit<BanRecord, 'id' | 'timestamp'>): Promise<BanRecord> => {
  return await firestoreService.banUser(banRecord);
};

export const unbanUser = async (id: string, adminId: string): Promise<boolean> => {
  return await firestoreService.unbanUser(id, adminId);
};

export const isUserBanned = async (identifier: string): Promise<BanRecord | null> => {
  return await firestoreService.isUserBanned(identifier);
};

// Admin Actions Logging
export const getAdminActions = async (): Promise<AdminAction[]> => {
  return await firestoreService.getAdminActions();
};

export const logAdminAction = async (action: AdminAction): Promise<AdminAction> => {
  return await firestoreService.logAdminAction(action);
};

// Report and Feedback Management
export const addReportOrFeedback = async (
  type: 'report' | 'feedback', 
  userId: string, 
  content: string
): Promise<ReportFeedback> => {
  return await firestoreService.addReportOrFeedback(type, userId, content);
};

export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  return await firestoreService.getReportsAndFeedback();
};

export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  return await firestoreService.resolveReportOrFeedback(id);
};

export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  return await firestoreService.deleteReportOrFeedback(id);
};

export const cleanupExpiredReportsFeedback = async (): Promise<void> => {
  await firestoreService.cleanupExpiredReportsFeedback();
};

// Admin Authentication
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  return await firebaseAuth.verifyAdminCredentials(email, password);
};

export const setAdminLoggedIn = (isLoggedIn: boolean): void => {
  // This is now handled by Firebase Auth directly
  // Only keeping for backward compatibility
  localStorage.setItem('adminData', JSON.stringify({ authenticated: isLoggedIn }));
};

export const isAdminLoggedIn = (): boolean => {
  // Check Firebase auth state first
  const user = firebaseAuth.getCurrentUser();
  if (user && firebaseAuth.isUserAdmin(user)) {
    return true;
  }
  
  // Fall back to localStorage for backward compatibility
  const adminData = localStorage.getItem('adminData');
  if (!adminData) return false;
  
  try {
    const data = JSON.parse(adminData);
    return data.authenticated === true;
  } catch {
    return false;
  }
};

export const adminLogout = async (): Promise<void> => {
  // Sign out from Firebase
  await firebaseAuth.signOutUser();
  
  // Clear admin session from localStorage for backward compatibility
  localStorage.removeItem('adminData');
};

// User Management (for Standard/VIP users)
export const kickUser = async (userId: string, adminId: string): Promise<AdminAction> => {
  return await firestoreService.kickUser(userId, adminId);
};

export const upgradeToVIP = async (
  userId: string, 
  adminId: string, 
  duration: VipDuration = 'Lifetime'
): Promise<AdminAction> => {
  return await firestoreService.upgradeToVIP(userId, adminId, duration);
};

export const downgradeToStandard = async (userId: string, adminId: string): Promise<AdminAction> => {
  return await firestoreService.downgradeToStandard(userId, adminId);
};

// For compatibility with existing code that expects synchronous operations
export const calculateExpiryDate = (duration: VipDuration): Date | null => {
  const now = new Date();
  
  if (duration === '1 Day') {
    return new Date(now.setDate(now.getDate() + 1));
  } else if (duration === '1 Week') {
    return new Date(now.setDate(now.getDate() + 7));
  } else if (duration === '1 Month') {
    return new Date(now.setMonth(now.getMonth() + 1));
  } else if (duration === '1 Year') {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  } else if (duration === 'Lifetime') {
    return null; // No expiry
  }
  
  return new Date(now.setDate(now.getDate() + 1)); // Default to 1 day if unknown
};
