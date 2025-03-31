
import { 
  collection, 
  getDocs, 
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { AdminAction } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { timestampToDate, dateToTimestamp } from './utils';

// Collection name
const ADMIN_ACTIONS_COLLECTION = 'adminActions';

// Admin Actions Logging
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    const actionsSnapshot = await getDocs(collection(db, ADMIN_ACTIONS_COLLECTION));
    return actionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp ? timestampToDate(data.timestamp as Timestamp).toISOString() : new Date().toISOString(),
        id: doc.id,
        adminId: data.adminId || '',
        adminName: data.adminName || '',
        actionType: data.actionType || 'other',
        details: data.details || ''
      } as AdminAction;
    });
  } catch (error) {
    console.error('Error getting admin actions:', error);
    return []; // Return empty array as fallback
  }
};

export const logAdminAction = async (action: Partial<AdminAction>): Promise<AdminAction> => {
  try {
    const timestamp = action.timestamp instanceof Date ? 
      action.timestamp.toISOString() : 
      new Date().toISOString();
    
    const actionToStore = {
      ...action,
      timestamp: dateToTimestamp(new Date(timestamp)),
      adminId: action.adminId || '',
      adminName: action.adminName || '',
      actionType: action.actionType || 'other',
      details: action.details || ''
    };
    
    const docRef = await addDoc(collection(db, ADMIN_ACTIONS_COLLECTION), actionToStore);
    
    // Return the action with the generated id
    return {
      ...action,
      id: docRef.id,
      timestamp,
      adminId: action.adminId || '',
      adminName: action.adminName || '',
      actionType: action.actionType || 'other',
      details: action.details || ''
    } as AdminAction;
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Return the action with a temporary ID as fallback
    return {
      ...action,
      id: `temp-${uuidv4()}`,
      timestamp: new Date().toISOString(),
      adminId: action.adminId || '',
      adminName: action.adminName || '',
      actionType: action.actionType || 'other',
      details: action.details || ''
    } as AdminAction;
  }
};
