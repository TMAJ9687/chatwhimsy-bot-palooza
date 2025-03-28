import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db, storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Bot } from '@/types/chat';
import { AdminAction, BanRecord, ReportFeedback, VipDuration } from '@/types/admin';
import { botProfiles } from '@/data/botProfiles';
import { v4 as uuidv4 } from 'uuid';

// Collection names
const BOTS_COLLECTION = 'bots';
const BANNED_USERS_COLLECTION = 'bannedUsers';
const ADMIN_ACTIONS_COLLECTION = 'adminActions';
const REPORTS_COLLECTION = 'reports';

// Convert Firestore timestamp to Date
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firestore timestamp
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Initialize the database with default data
export const initializeFirestoreData = async (): Promise<void> => {
  try {
    // Check if bots collection is already populated
    const botsSnapshot = await getDocs(collection(db, BOTS_COLLECTION));
    
    // If bots collection is empty, populate with default bots
    if (botsSnapshot.empty) {
      const promises = botProfiles.map(bot => setDoc(doc(db, BOTS_COLLECTION, bot.id), bot));
      await Promise.all(promises);
      console.log('Firestore initialized with default bot data');
    }
  } catch (error) {
    console.error('Error initializing Firestore data:', error);
    throw error;
  }
};

// File upload to Firebase Storage
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `${path}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

// Bot Management
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    const botsSnapshot = await getDocs(collection(db, BOTS_COLLECTION));
    return botsSnapshot.docs.map(doc => doc.data() as Bot);
  } catch (error) {
    console.error('Error getting all bots:', error);
    // Return botProfiles as fallback
    return botProfiles;
  }
};

export const getBot = async (id: string): Promise<Bot | undefined> => {
  try {
    const botDoc = await getDoc(doc(db, BOTS_COLLECTION, id));
    return botDoc.exists() ? botDoc.data() as Bot : undefined;
  } catch (error) {
    console.error('Error getting bot:', error);
    // Return from botProfiles as fallback
    return botProfiles.find(bot => bot.id === id);
  }
};

export const createBot = async (bot: Omit<Bot, 'id'>): Promise<Bot> => {
  try {
    const newBot: Bot = {
      ...bot,
      id: `bot-${uuidv4().slice(0, 8)}`
    };
    
    await setDoc(doc(db, BOTS_COLLECTION, newBot.id), newBot);
    return newBot;
  } catch (error) {
    console.error('Error creating bot:', error);
    throw error;
  }
};

export const updateBot = async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
  try {
    const botRef = doc(db, BOTS_COLLECTION, id);
    const botDoc = await getDoc(botRef);
    
    if (!botDoc.exists()) return null;
    
    const updatedBot = { ...botDoc.data(), ...updates } as Bot;
    await updateDoc(botRef, updates);
    return updatedBot;
  } catch (error) {
    console.error('Error updating bot:', error);
    // Find bot in local data and return updated version as fallback
    const localBot = botProfiles.find(bot => bot.id === id);
    if (localBot) {
      return { ...localBot, ...updates };
    }
    return null;
  }
};

export const deleteBot = async (id: string): Promise<boolean> => {
  try {
    const botRef = doc(db, BOTS_COLLECTION, id);
    const botDoc = await getDoc(botRef);
    
    if (!botDoc.exists()) return false;
    
    await deleteDoc(botRef);
    return true;
  } catch (error) {
    console.error('Error deleting bot:', error);
    throw error;
  }
};

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

// Admin Actions Logging
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    const actionsSnapshot = await getDocs(collection(db, ADMIN_ACTIONS_COLLECTION));
    return actionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp ? timestampToDate(data.timestamp as Timestamp) : new Date(),
        id: doc.id
      } as AdminAction;
    });
  } catch (error) {
    console.error('Error getting admin actions:', error);
    return []; // Return empty array as fallback
  }
};

export const logAdminAction = async (action: AdminAction): Promise<AdminAction> => {
  try {
    const actionToStore = {
      ...action,
      timestamp: dateToTimestamp(action.timestamp)
    };
    
    const docRef = await addDoc(collection(db, ADMIN_ACTIONS_COLLECTION), actionToStore);
    
    // Return the action with the generated id
    return {
      ...action,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Return the action with a temporary ID as fallback
    return {
      ...action,
      id: `temp-${uuidv4()}`
    };
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

// Report and Feedback Management
export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  try {
    // Clean up expired items first
    await cleanupExpiredReportsFeedback();
    
    const reportsSnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    return reportsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp ? timestampToDate(data.timestamp as Timestamp) : new Date(),
        expiresAt: data.expiresAt ? timestampToDate(data.expiresAt as Timestamp) : new Date(Date.now() + 86400000),
        id: doc.id
      } as ReportFeedback;
    });
  } catch (error) {
    console.error('Error getting reports and feedback:', error);
    return []; // Return empty array as fallback
  }
};

export const addReportOrFeedback = async (
  type: 'report' | 'feedback', 
  userId: string, 
  content: string
): Promise<ReportFeedback> => {
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
  
  // Convert dates to Firestore timestamps
  const firestoreItem = {
    ...item,
    timestamp: dateToTimestamp(now),
    expiresAt: dateToTimestamp(expiresAt)
  };
  
  await setDoc(doc(db, REPORTS_COLLECTION, item.id), firestoreItem);
  
  return item;
};

export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  const reportRef = doc(db, REPORTS_COLLECTION, id);
  const reportDoc = await getDoc(reportRef);
  
  if (!reportDoc.exists()) return false;
  
  await updateDoc(reportRef, { resolved: true });
  return true;
};

export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  const reportRef = doc(db, REPORTS_COLLECTION, id);
  const reportDoc = await getDoc(reportRef);
  
  if (!reportDoc.exists()) return false;
  
  await deleteDoc(reportRef);
  return true;
};

export const cleanupExpiredReportsFeedback = async (): Promise<void> => {
  const now = new Date();
  const reportsSnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
  
  const deletePromises = reportsSnapshot.docs
    .filter(doc => {
      const data = doc.data();
      const expiryDate = timestampToDate(data.expiresAt as Timestamp);
      return expiryDate < now;
    })
    .map(doc => deleteDoc(doc.ref));
  
  await Promise.all(deletePromises);
};

// User Management
export const kickUser = async (userId: string, adminId: string): Promise<AdminAction> => {
  return await logAdminAction({
    id: uuidv4(),
    actionType: 'kick',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  });
};

export const upgradeToVIP = async (
  userId: string, 
  adminId: string, 
  duration: VipDuration = 'Lifetime'
): Promise<AdminAction> => {
  return await logAdminAction({
    id: uuidv4(),
    actionType: 'upgrade',
    targetId: userId,
    targetType: 'user',
    duration: duration,
    timestamp: new Date(),
    adminId: adminId
  });
};

export const downgradeToStandard = async (userId: string, adminId: string): Promise<AdminAction> => {
  return await logAdminAction({
    id: uuidv4(),
    actionType: 'downgrade',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  });
};
