
// Admin types
export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  actionType: 'ban' | 'unban' | 'delete' | 'edit' | 'other' | 'kick' | 'upgrade' | 'downgrade';
  details: string;
  timestamp: string;
  userId?: string;
}

export interface BanRecord {
  id: string;
  userId: string;
  reason: string;
  adminId: string;
  timestamp: string;
  duration?: string;
  expires?: string;
  identifier?: string;
  identifierType?: string;
  expiresAt?: string;
}

export interface ReportFeedback {
  id: string;
  type: 'report' | 'feedback';
  userId: string;
  content: string;
  timestamp: string;
  expires?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  theme: string;
  adminContact: string;
}

// Change from interface to string union type
export type VipDuration = '1 Day' | '1 Week' | '1 Month' | '1 Year' | 'Lifetime';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  vipUsers: number;
  totalMessages: number;
  reportsCount: number;
}
