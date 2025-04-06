
import { BanRecord, AdminAction } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

// Track online users with better memory management
const onlineUsers = new Set<string>();
const userTimeouts = new Map<string, NodeJS.Timeout>();
const MAX_ONLINE_USERS = 100; // Set a reasonable limit for tracking

/**
 * User tracking functions for admin dashboard
 */
export const trackUserActivity = (userId: string, isOnline: boolean): void => {
  // Clear existing timeout if any
  if (userTimeouts.has(userId)) {
    clearTimeout(userTimeouts.get(userId));
    userTimeouts.delete(userId);
  }
  
  if (isOnline) {
    // Limit the total number of tracked users to prevent memory leaks
    if (onlineUsers.size >= MAX_ONLINE_USERS && !onlineUsers.has(userId)) {
      // If we're at capacity and trying to add a new user,
      // remove the oldest user (first in the set)
      const oldestUser = onlineUsers.values().next().value;
      if (oldestUser) {
        onlineUsers.delete(oldestUser);
        console.log(`User tracking limit reached. Removing oldest tracked user: ${oldestUser}`);
      }
    }
    
    onlineUsers.add(userId);
    
    // Set a timeout to automatically set user offline after inactivity
    const timeout = setTimeout(() => {
      onlineUsers.delete(userId);
      userTimeouts.delete(userId);
      console.log(`User ${userId} automatically marked offline due to inactivity`);
    }, 15 * 60 * 1000); // 15 minutes timeout
    
    userTimeouts.set(userId, timeout);
  } else {
    onlineUsers.delete(userId);
  }
  
  // Limit logging to reduce console spam
  if (onlineUsers.size % 10 === 0 || onlineUsers.size < 10) {
    console.log(`User tracking: ${userId} is now ${isOnline ? 'online' : 'offline'}. Total online: ${onlineUsers.size}`);
  }
};

// Clean up all timeouts - important for preventing memory leaks
export const cleanupUserTracking = (): void => {
  userTimeouts.forEach((timeout) => {
    clearTimeout(timeout);
  });
  userTimeouts.clear();
  onlineUsers.clear();
  console.log("User tracking cleaned up");
};

export const getOnlineUserCount = (): number => {
  return onlineUsers.size;
};

export const getOnlineUserIds = (): string[] => {
  return Array.from(onlineUsers);
};

/**
 * User management functions
 */
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  try {
    // In a real implementation, this would fetch from the database
    return [
      {
        id: "ban-1",
        identifier: "user-123",
        identifierType: "user",
        reason: "Inappropriate behavior",
        duration: "1 Week",
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        adminId: "admin-1"
      }
    ];
  } catch (error) {
    console.error('Error getting banned users:', error);
    return [];
  }
};

export const kickUser = async (userId: string, adminId: string): Promise<AdminAction | null> => {
  try {
    // Mock implementation
    const action: AdminAction = {
      id: `action-${Date.now()}`,
      actionType: "kick",
      targetId: userId,
      targetType: "user",
      timestamp: new Date(),
      adminId
    };
    
    console.log('Kicked user:', userId);
    return action;
  } catch (error) {
    console.error('Error kicking user:', error);
    return null;
  }
};

export const banUser = async (params: {
  identifier: string,
  identifierType: 'user' | 'ip',
  reason: string,
  duration: string,
  adminId: string
}): Promise<BanRecord | null> => {
  try {
    // Mock implementation
    const banRecord: BanRecord = {
      id: `ban-${Date.now()}`,
      identifier: params.identifier,
      identifierType: params.identifierType,
      reason: params.reason,
      duration: params.duration,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week by default
      adminId: params.adminId
    };
    
    console.log('Banned user:', params.identifier);
    return banRecord;
  } catch (error) {
    console.error('Error banning user:', error);
    return null;
  }
};

export const unbanUser = async (banId: string, adminId: string): Promise<boolean> => {
  try {
    // Mock implementation
    console.log('Unbanned user with ban ID:', banId);
    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
};

export const upgradeToVIP = async (userId: string, adminId: string, duration: string): Promise<AdminAction | null> => {
  try {
    // Mock implementation
    const action: AdminAction = {
      id: `action-${Date.now()}`,
      actionType: "upgradeVIP",
      targetId: userId,
      targetType: "user",
      duration,
      timestamp: new Date(),
      adminId
    };
    
    console.log('Upgraded user to VIP:', userId, 'for duration:', duration);
    return action;
  } catch (error) {
    console.error('Error upgrading user to VIP:', error);
    return null;
  }
};

export const downgradeToStandard = async (userId: string, adminId: string): Promise<AdminAction | null> => {
  try {
    // Mock implementation
    const action: AdminAction = {
      id: `action-${Date.now()}`,
      actionType: "downgradeVIP",
      targetId: userId,
      targetType: "user",
      timestamp: new Date(),
      adminId
    };
    
    console.log('Downgraded user from VIP:', userId);
    return action;
  } catch (error) {
    console.error('Error downgrading user from VIP:', error);
    return null;
  }
};
