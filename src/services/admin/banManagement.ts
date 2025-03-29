
import { BanRecord } from '@/types/admin';
import * as firestoreService from '@/firebase/firestore';

/**
 * Get all banned users
 */
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  try {
    return await firestoreService.getBannedUsers();
  } catch (error) {
    console.error('Error getting banned users, using empty array:', error);
    return [];
  }
};

/**
 * Ban a user
 */
export const banUser = async (banRecord: Omit<BanRecord, 'id' | 'timestamp'>): Promise<BanRecord> => {
  return await firestoreService.banUser(banRecord);
};

/**
 * Unban a user
 */
export const unbanUser = async (id: string, adminId: string): Promise<boolean> => {
  return await firestoreService.unbanUser(id, adminId);
};

/**
 * Check if a user is banned
 */
export const isUserBanned = async (identifier: string): Promise<BanRecord | null> => {
  return await firestoreService.isUserBanned(identifier);
};
