
import { AdminAction } from '@/types/admin';
import * as firestoreService from '@/firebase/firestore';

/**
 * Get all admin actions
 */
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    return await firestoreService.getAdminActions();
  } catch (error) {
    console.error('Error getting admin actions, using empty array:', error);
    return [];
  }
};

/**
 * Log an admin action
 */
export const logAdminAction = async (action: AdminAction): Promise<AdminAction> => {
  return await firestoreService.logAdminAction(action);
};
