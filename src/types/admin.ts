
import { Bot } from './chat';
import { UserProfile } from './user';

export interface AdminProfile extends UserProfile {
  isAdmin: boolean;
  displayName: string;
}

export interface AdminState {
  isAdmin: boolean;
  authenticated: boolean;
  lastLogin?: Date;
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

export type VipDuration = '1 Day' | '1 Week' | '1 Month' | '1 Year' | 'Lifetime';

export interface ReportFeedback {
  id: string;
  type: 'report' | 'feedback';
  userId: string;
  content: string;
  timestamp: Date;
  expiresAt: Date; // Auto-delete after 24 hours
  resolved: boolean;
}

// Admin dashboard specific types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  vipUsers: number;
  bannedUsers: number;
  reportsPending: number;
}

export interface AdminSettings {
  emailNotifications: boolean;
  autoDeleteReports: boolean;
  autoDeleteAfterHours: number;
}
