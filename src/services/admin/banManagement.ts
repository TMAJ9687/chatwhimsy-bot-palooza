
import { BanRecord } from '@/types/admin';
import * as firebaseCollection from '@/firebase/firestore/banCollection';

/**
 * Get all banned users
 */
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  try {
    const banRecords = await firebaseCollection.getBannedUsers();
    // Convert the firestore ban records to the admin type
    return banRecords.map(record => {
      return {
        id: record.id,
        userId: record.id, // Use id as userId for compatibility
        identifier: record.identifier,
        identifierType: record.identifierType,
        reason: record.reason,
        duration: record.duration,
        timestamp: record.timestamp,
        expiresAt: record.expiresAt,
        permanent: record.permanent,
        adminId: record.adminId
      } as BanRecord;
    });
  } catch (error) {
    console.error('Error getting banned users:', error);
    return [];
  }
};

/**
 * Ban a user
 */
export const banUser = async (banData: Omit<BanRecord, 'id'>): Promise<BanRecord> => {
  try {
    const { userId, ...otherData } = banData;
    const banRecord = await firebaseCollection.banUser(otherData);
    return {
      ...banRecord,
      userId: banRecord.id // Use id as userId for compatibility
    } as BanRecord;
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

/**
 * Unban a user
 */
export const unbanUser = async (banId: string): Promise<boolean> => {
  try {
    return await firebaseCollection.unbanUser(banId);
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

/**
 * Check if a user is banned
 */
export const isUserBanned = async (userId: string): Promise<boolean> => {
  try {
    return await firebaseCollection.isUserBanned(userId);
  } catch (error) {
    console.error('Error checking if user is banned:', error);
    return false;
  }
};
