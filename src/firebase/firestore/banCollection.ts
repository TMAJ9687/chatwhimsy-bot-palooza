
import { 
  collection, 
  doc, 
  setDoc, 
  where,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config';
import { BanRecord } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { logAdminAction } from './adminActionCollection';
import { dateToTimestamp } from './utils';
import { 
  getDocumentsFromCollection, 
  queryDocumentsFromCollection,
  convertTimestampFields
} from './dbUtils';

// Collection name
export const BANNED_USERS_COLLECTION = 'bannedUsers';

// Ban Management
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  return await getDocumentsFromCollection<BanRecord>(
    BANNED_USERS_COLLECTION,
    (doc) => convertTimestampFields<BanRecord>(doc, ['timestamp', 'expiresAt'])
  );
};

export const banUser = async (banRecord: Omit<BanRecord, 'id' | 'timestamp'>): Promise<BanRecord> => {
  try {
    const now = new Date();
    
    // Calculate expiry date
    let expiresAt: Date | undefined = undefined;
    if (banRecord.duration !== 'Permanent') {
      expiresAt = calculateExpiryDate(banRecord.duration);
    }
    
    const newBan: BanRecord = {
      ...banRecord,
      id: uuidv4(),
      timestamp: now,
      expiresAt
    };
    
    // Convert dates to Firestore timestamps
    const firestoreBan = {
      ...newBan,
      timestamp: dateToTimestamp(now),
      expiresAt: expiresAt ? dateToTimestamp(expiresAt) : null
    };
    
    await setDoc(doc(db, BANNED_USERS_COLLECTION, newBan.id), firestoreBan);
    
    // Log admin action
    await logAdminAction({
      id: uuidv4(),
      actionType: 'ban',
      targetId: banRecord.identifier,
      targetType: banRecord.identifierType,
      reason: banRecord.reason,
      duration: banRecord.duration,
      timestamp: now,
      adminId: banRecord.adminId
    });
    
    return newBan;
  } catch (error) {
    console.error('Error banning user:', error);
    throw new Error('Failed to ban user');
  }
};

export const unbanUser = async (id: string, adminId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, BANNED_USERS_COLLECTION, id);
    const docSnapshot = await db.getDoc(docRef);
    
    if (!docSnapshot.exists()) return false;
    
    const banData = convertTimestampFields<BanRecord>(
      { ...docSnapshot.data(), id: docSnapshot.id },
      ['timestamp', 'expiresAt']
    );
    
    await deleteDoc(docRef);
    
    // Log admin action
    await logAdminAction({
      id: uuidv4(),
      actionType: 'unban',
      targetId: banData.identifier,
      targetType: banData.identifierType,
      timestamp: new Date(),
      adminId: adminId
    });
    
    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
};

export const isUserBanned = async (identifier: string): Promise<BanRecord | null> => {
  try {
    const bannedUsers = await queryDocumentsFromCollection<BanRecord>(
      BANNED_USERS_COLLECTION,
      [where('identifier', '==', identifier)],
      (doc) => convertTimestampFields<BanRecord>(doc, ['timestamp', 'expiresAt'])
    );
    
    if (bannedUsers.length === 0) return null;
    
    const ban = bannedUsers[0];
    
    // Check if ban has expired
    if (ban.expiresAt && new Date() > ban.expiresAt) {
      // Remove expired ban
      await deleteDoc(doc(db, BANNED_USERS_COLLECTION, ban.id));
      return null;
    }
    
    return ban;
  } catch (error) {
    console.error('Error checking if user is banned:', error);
    return null;
  }
};

// Helper function
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
