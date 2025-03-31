
import { v4 as uuidv4 } from 'uuid';
import { VipDuration } from '@/types/admin';
import { logAdminAction } from './adminActionCollection';

// User Management
export const kickUser = async (userId: string, adminId: string): Promise<any> => {
  return await logAdminAction({
    id: uuidv4(),
    actionType: 'kick',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId,
    adminName: '',
    details: ''
  });
};

export const upgradeToVIP = async (
  userId: string, 
  adminId: string, 
  duration: VipDuration = 'Lifetime'
): Promise<any> => {
  return await logAdminAction({
    id: uuidv4(),
    actionType: 'upgrade',
    targetId: userId,
    targetType: 'user',
    duration: duration,
    timestamp: new Date(),
    adminId: adminId,
    adminName: '',
    details: ''
  });
};

export const downgradeToStandard = async (userId: string, adminId: string): Promise<any> => {
  return await logAdminAction({
    id: uuidv4(),
    actionType: 'downgrade',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId,
    adminName: '',
    details: ''
  });
};
