
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { BanRecord } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { logAdminAction } from './adminActionCollection';
import { timestampToDate, dateToTimestamp } from './utils';

// Collection name
const BANNED_USERS_COLLECTION = 'bannedUsers';

// Ban Management
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  try {
    const bannedSnapshot = await getDocs(collection(db, BANNED_USERS_COLLECTION));
    return bannedSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp ? timestampToDate(data.timestamp as Timestamp) : new Date(),
        expiresAt: data.expiresAt ? timestampToDate(data.expiresAt as Timestamp) : undefined,
        id: doc.id
      } as BanRecord;
    });
  } catch (error) {
    console.error('Error getting banned users:', error);
    return []; // Return empty array as fallback
  }
};

export const banUser = async (banRecord: Omit<BanRecord, 'id' | 'timestamp'>): Promise<BanRecord> => {
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
};

export const unbanUser = async (id: string, adminId: string): Promise<boolean> => {
  const banRef = doc(db, BANNED_USERS_COLLECTION, id);
  const banDoc = await getDoc(banRef);
  
  if (!banDoc.exists()) return false;
  
  const banData = banDoc.data() as BanRecord;
  
  await deleteDoc(banRef);
  
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
};

export const isUserBanned = async (identifier: string): Promise<BanRecord | null> => {
  const bannedQuery = query(
    collection(db, BANNED_USERS_COLLECTION), 
    where('identifier', '==', identifier)
  );
  
  const bannedSnapshot = await getDocs(bannedQuery);
  
  if (bannedSnapshot.empty) return null;
  
  const banDoc = bannedSnapshot.docs[0];
  const ban = banDoc.data() as any;
  
  // Check if ban has expired
  if (ban.expiresAt) {
    const expiryDate = timestampToDate(ban.expiresAt);
    if (new Date() > expiryDate) {
      // Remove expired ban
      await deleteDoc(banDoc.ref);
      return null;
    }
  }
  
  return {
    ...ban,
    timestamp: timestampToDate(ban.timestamp),
    expiresAt: ban.expiresAt ? timestampToDate(ban.expiresAt) : undefined,
    id: banDoc.id
  };
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
