
import { AdminAction, VipDuration } from '@/types/admin';
import * as firestoreService from '@/firebase/firestore';

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
