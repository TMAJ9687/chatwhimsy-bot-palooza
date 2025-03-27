
/**
 * Service for admin-specific operations
 */
export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'superadmin';
  lastLogin?: Date;
}

export interface BannedUser {
  userId: string;
  username: string;
  reason: string;
  bannedBy: string;
  bannedAt: Date;
  duration: 'permanent' | '1_day' | '7_days' | '30_days';
  expiresAt?: Date;
}

export interface ReportedContent {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  reportedBy: string;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'resolved' | 'dismissed';
  contentType: 'message' | 'user';
  contentId?: string;
  messageContent?: string;
}

export interface Feedback {
  id: string;
  userId?: string;
  username?: string;
  content: string;
  timestamp: Date;
  status: 'new' | 'read' | 'resolved';
}

export interface SiteSettings {
  maintenanceMode: boolean;
  maxImageUploadCount: number;
  adsenseLinks: {
    unit1: string;
    unit2: string;
    unit3: string;
  };
  vipPrices: {
    monthly: number;
    semiannual: number;
    annual: number;
  };
}

// Mock data for initial development
const mockAdmins: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    displayName: 'Site Administrator',
    role: 'superadmin',
    lastLogin: new Date()
  }
];

const mockVipUsers = Array.from({ length: 10 }, (_, i) => ({
  id: `vip-${i + 1}`,
  nickname: `VipUser${i + 1}`,
  email: `vip${i + 1}@example.com`,
  gender: i % 2 === 0 ? 'male' : 'female',
  age: 20 + i,
  country: 'us',
  isVip: true,
  subscriptionTier: i % 3 === 0 ? 'monthly' : i % 3 === 1 ? 'semiannual' : 'annual',
  subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  online: i % 3 === 0,
  lastLogin: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
  registrationDate: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000),
  imagesRemaining: 10,
  voiceMessagesRemaining: 5
}));

const mockStandardUsers = Array.from({ length: 15 }, (_, i) => ({
  id: `user-${i + 1}`,
  nickname: `User${i + 1}`,
  email: `user${i + 1}@example.com`,
  gender: i % 2 === 0 ? 'male' : 'female',
  age: 18 + i,
  country: 'uk',
  isVip: false,
  online: i % 2 === 0,
  lastLogin: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
  registrationDate: new Date(Date.now() - (i + 20) * 24 * 60 * 60 * 1000),
  imagesRemaining: 5,
  voiceMessagesRemaining: 2
}));

const mockBannedUsers: BannedUser[] = [
  {
    userId: 'user-banned-1',
    username: 'BannedUser1',
    reason: 'Inappropriate behavior',
    bannedBy: 'admin-1',
    bannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: '7_days',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    userId: 'user-banned-2',
    username: 'BannedUser2',
    reason: 'Spam messages',
    bannedBy: 'admin-1',
    bannedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    duration: 'permanent'
  }
];

const mockReports: ReportedContent[] = [
  {
    id: 'report-1',
    reportedUserId: 'user-2',
    reportedUsername: 'User2',
    reportedBy: 'user-3',
    reason: 'Harassment',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'pending',
    contentType: 'user'
  },
  {
    id: 'report-2',
    reportedUserId: 'user-5',
    reportedUsername: 'User5',
    reportedBy: 'vip-2',
    reason: 'Inappropriate content',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    contentType: 'message',
    contentId: 'msg-12345',
    messageContent: 'This is the reported message content...'
  }
];

const mockFeedback: Feedback[] = [
  {
    id: 'feedback-1',
    userId: 'vip-3',
    username: 'VipUser3',
    content: 'Love the new chat interface!',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'new'
  },
  {
    id: 'feedback-2',
    content: 'The site loads slowly sometimes.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'read'
  }
];

const mockSiteSettings: SiteSettings = {
  maintenanceMode: false,
  maxImageUploadCount: 10,
  adsenseLinks: {
    unit1: '',
    unit2: '',
    unit3: ''
  },
  vipPrices: {
    monthly: 9.99,
    semiannual: 49.99,
    annual: 89.99
  }
};

// Admin service class
class AdminService {
  // Authentication methods
  isAdmin(userId: string): boolean {
    return mockAdmins.some(admin => admin.id === userId);
  }

  getAdminByUsername(username: string): AdminUser | undefined {
    return mockAdmins.find(admin => admin.username === username);
  }

  // User management methods
  getVipUsers() {
    return mockVipUsers;
  }

  getStandardUsers() {
    return mockStandardUsers.filter(user => user.online);
  }

  getBannedUsers() {
    return mockBannedUsers;
  }

  // Report methods
  getReports() {
    return mockReports;
  }

  updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    const report = mockReports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
    }
    return report;
  }

  // Feedback methods
  getFeedback() {
    return mockFeedback;
  }

  updateFeedbackStatus(feedbackId: string, status: 'read' | 'resolved') {
    const feedback = mockFeedback.find(f => f.id === feedbackId);
    if (feedback) {
      feedback.status = status;
    }
    return feedback;
  }

  // Site settings methods
  getSiteSettings() {
    return mockSiteSettings;
  }

  updateSiteSettings(settings: Partial<SiteSettings>) {
    Object.assign(mockSiteSettings, settings);
    return mockSiteSettings;
  }

  // Mock actions for users
  kickUser(userId: string) {
    console.log(`User ${userId} has been kicked`);
    return true;
  }

  banUser(userId: string, duration: BannedUser['duration'], reason: string, adminId: string) {
    const userToFind = [...mockVipUsers, ...mockStandardUsers].find(u => u.id === userId);
    
    if (!userToFind) return false;
    
    const bannedUser: BannedUser = {
      userId,
      username: userToFind.nickname,
      reason,
      bannedBy: adminId,
      bannedAt: new Date(),
      duration,
      expiresAt: duration !== 'permanent' ? this.calculateExpiryDate(duration) : undefined
    };
    
    mockBannedUsers.push(bannedUser);
    return true;
  }

  unbanUser(userId: string) {
    const index = mockBannedUsers.findIndex(banned => banned.userId === userId);
    if (index !== -1) {
      mockBannedUsers.splice(index, 1);
      return true;
    }
    return false;
  }

  private calculateExpiryDate(duration: Exclude<BannedUser['duration'], 'permanent'>): Date {
    const now = new Date();
    switch (duration) {
      case '1_day':
        return new Date(now.setDate(now.getDate() + 1));
      case '7_days':
        return new Date(now.setDate(now.getDate() + 7));
      case '30_days':
        return new Date(now.setDate(now.getDate() + 30));
      default:
        return new Date(now.setDate(now.getDate() + 1));
    }
  }
}

export const adminService = new AdminService();
