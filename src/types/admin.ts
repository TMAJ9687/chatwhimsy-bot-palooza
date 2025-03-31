
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  lastLogin?: string;
  createdAt: string;
  displayName?: string;
}

export interface BanRecord {
  id: string;
  userId: string;
  reason: string;
  adminId: string;
  timestamp: string;
  duration?: number; // in days, null means permanent
  expires?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  actionType: 'ban' | 'unban' | 'delete' | 'edit' | 'other';
  details: string;
  timestamp: string;
  userId?: string;
  contentId?: string;
}

export interface ReportFeedback {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'user' | 'message' | 'content';
  reason: string;
  details?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  actionTaken?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AdminSettings {
  id: string;
  maxReportsBeforeAutoFlag: number;
  autobanEnabled: boolean;
  maxLoginAttempts: number;
  loginLockoutDuration: number; // in minutes
  reportExpiryDays: number;
  moderationKeywords: string[];
  updatedAt: string;
  updatedBy: string;
}
