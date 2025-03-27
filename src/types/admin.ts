
import { Bot } from './chat';
import { UserProfile } from './user';

export interface AdminProfile extends UserProfile {
  isAdmin: boolean;
  displayName: string;
}

export interface AdminState {
  isAdmin: boolean;
  authenticated: boolean;
}

export interface AdminAction {
  id: string;
  actionType: 'kick' | 'ban' | 'unban' | 'edit' | 'upgrade' | 'downgrade';
  targetId: string;
  targetType: 'user' | 'bot' | 'ip';
  reason?: string;
  duration?: string;
  timestamp: Date;
  adminId: string;
}

export interface BanRecord {
  id: string;
  identifier: string; // username or IP
  identifierType: 'user' | 'ip';
  reason: string;
  duration: string;
  timestamp: Date;
  expiresAt?: Date;
  adminId: string;
}
