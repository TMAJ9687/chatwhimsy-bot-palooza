import { v4 as uuidv4 } from 'uuid';

// Interface for ban records
export interface BanRecord {
  id: string;
  identifier: string;  // User ID, IP, etc.
  identifierType: 'userId' | 'ip' | 'email';
  reason: string;
  duration: string;  // "1 day", "1 week", "permanent", etc.
  timestamp: string;  // ISO string
  expiresAt: string | null;  // ISO string or null for permanent bans
  adminId: string;
}

// Ban a user
export const banUser = async (banData: Omit<BanRecord, 'id'>): Promise<BanRecord> => {
  // Generate ID for the ban record
  const id = uuidv4();
  
  // Create the ban record
  const banRecord: BanRecord = {
    id,
    identifier: banData.identifier,
    identifierType: banData.identifierType,
    reason: banData.reason,
    duration: banData.duration,
    timestamp: new Date().toISOString(),
    expiresAt: banData.expiresAt ? new Date(banData.expiresAt).toISOString() : null,
    adminId: banData.adminId
  };
  
  // Log ban action
  console.log(`User banned: ${banRecord.identifier} (${banRecord.identifierType})`);
  
  return banRecord;
};

// Unban a user
export const unbanUser = async (banId: string): Promise<boolean> => {
  // Implementation will be replaced with actual database operations
  console.log(`Ban removed: ${banId}`);
  return true;
};

// Get all banned users
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  // Implementation will be replaced with actual database operations
  return [];
};

// Check if a user is banned
export const isUserBanned = async (identifier: string, identifierType: 'userId' | 'ip' | 'email'): Promise<BanRecord | null> => {
  // Get all banned users
  const bannedUsers = await getBannedUsers();
  
  // Find matching ban record
  const banRecord = bannedUsers.find(record => 
    record.identifier === identifier && 
    record.identifierType === identifierType
  );
  
  if (!banRecord) {
    return null;
  }
  
  // Check if ban has expired
  if (banRecord.expiresAt) {
    const expiresAt = new Date(banRecord.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      // Ban has expired, remove it
      await unbanUser(banRecord.id);
      return null;
    }
  }
  
  return banRecord;
};

// Ban user by IP
export const banIP = async (ip: string, reason: string, duration: string, adminId: string): Promise<BanRecord> => {
  const ban: Omit<BanRecord, 'id'> = {
    identifier: ip,
    identifierType: 'ip',
    reason,
    duration,
    timestamp: new Date().toISOString(),
    expiresAt: duration === 'permanent' ? null : new Date(Date.now() + parseDuration(duration) * 1000).toISOString(),
    adminId
  };
  
  return await banUser(ban);
};

// Parse duration string to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)\s+(minute|hour|day|week|month|year)s?$/i);
  
  if (!match) {
    return 0;
  }
  
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  // Convert to seconds
  switch (unit) {
    case 'minute': return amount * 60;
    case 'hour': return amount * 60 * 60;
    case 'day': return amount * 24 * 60 * 60;
    case 'week': return amount * 7 * 24 * 60 * 60;
    case 'month': return amount * 30 * 24 * 60 * 60;
    case 'year': return amount * 365 * 24 * 60 * 60;
    default: return 0;
  }
}
