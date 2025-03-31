
// Define admin types

export type AdminActionType = 'ban' | 'unban' | 'kick' | 'upgrade' | 'downgrade' | 'delete' | 'edit' | 'other';

// Admin action record
export interface AdminAction {
  id: string;
  actionType: AdminActionType | string;  // Allow string for backward compatibility
  targetId?: string;
  targetType?: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  details: string;
  duration?: string;
}

// Ban record
export interface BanRecord {
  id: string;
  userId: string;
  identifier: string;
  identifierType: 'email' | 'ip' | 'userId';
  reason: string;
  duration: number;  // in hours, 0 for permanent
  timestamp: string;
  expiresAt: string;
  permanent: boolean;
  adminId: string;
}

// Report/feedback record
export interface ReportFeedback {
  id: string;
  type: 'report' | 'feedback';
  userId: string;
  content: string;
  timestamp: string;
  expiresAt: string;
  resolved: boolean;
  status: 'open' | 'closed' | 'reviewing';
}
