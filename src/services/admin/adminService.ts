
import { supabase } from '@/integrations/supabase/client';
import { AdminAction, ReportFeedback, BanRecord } from '@/types/admin';
import { Bot } from '@/types/chat';

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = async (): Promise<boolean> => {
  try {
    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // In a real app, you would check admin role via RLS or custom claims
    // For now, we'll use localStorage as a fallback for demo purposes
    const isAdmin = localStorage.getItem('adminEmail') === session.user.email;
    
    if (!isAdmin) {
      // This would typically check against admin roles in the database
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .single();
      
      if (error || !data) {
        console.log('User is not an admin according to database');
        return false;
      }
      
      return true;
    }
    
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Admin login
 */
export const adminLogin = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error('Admin login error:', error.message);
      return false;
    }
    
    if (data.user) {
      // Store admin email in localStorage for demo purposes
      // In a real app, you would rely on server-side role verification
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminData', JSON.stringify({ email }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Admin login error:', error);
    return false;
  }
};

/**
 * Admin logout
 */
export const adminLogout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Admin logout error:', error.message);
    }
    
    // Clean up localStorage
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminData');
  } catch (error) {
    console.error('Admin logout error:', error);
  }
};

/**
 * Get admin actions
 */
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_actions')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching admin actions:', error);
      return [];
    }
    
    // Map the database fields to our typed fields
    return (data || []).map(item => ({
      id: item.id,
      actionType: item.action_type,
      targetId: item.target_id,
      targetType: item.target_type,
      reason: item.reason,
      duration: item.duration,
      timestamp: new Date(item.timestamp),
      adminId: item.admin_id
    }));
  } catch (error) {
    console.error('Error in getAdminActions:', error);
    return [];
  }
};

/**
 * Bot management functions
 */
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    // In a real implementation, this would fetch from the bots table
    // For now, return mock data
    return [
      {
        id: "bot-1",
        name: "Alex",
        age: 25,
        gender: "male",
        country: "United States",
        countryCode: "US",
        vip: false,
        interests: ["sports", "movies"],
        avatar: "/avatars/bot1.png",
        responses: []
      },
      {
        id: "bot-2",
        name: "Emma",
        age: 28,
        gender: "female",
        country: "Canada",
        countryCode: "CA",
        vip: true,
        interests: ["music", "travel"],
        avatar: "/avatars/bot2.png",
        responses: []
      }
    ];
  } catch (error) {
    console.error('Error getting bots:', error);
    return [];
  }
};

export const getBot = async (id: string): Promise<Bot | null> => {
  try {
    const bots = await getAllBots();
    return bots.find(bot => bot.id === id) || null;
  } catch (error) {
    console.error('Error getting bot:', error);
    return null;
  }
};

export const createBot = async (bot: Omit<Bot, 'id'>): Promise<Bot | null> => {
  try {
    // Create a new bot with a unique ID
    const newBot: Bot = {
      ...bot,
      id: `bot-${Date.now()}`
    };
    
    // In a real implementation, this would save to the database
    console.log('Created new bot:', newBot);
    
    return newBot;
  } catch (error) {
    console.error('Error creating bot:', error);
    return null;
  }
};

export const updateBot = async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
  try {
    // Get the existing bot
    const existingBot = await getBot(id);
    if (!existingBot) {
      console.error('Bot not found:', id);
      return null;
    }
    
    // Update the bot with the new data
    const updatedBot: Bot = {
      ...existingBot,
      ...updates
    };
    
    // In a real implementation, this would save to the database
    console.log('Updated bot:', updatedBot);
    
    return updatedBot;
  } catch (error) {
    console.error('Error updating bot:', error);
    return null;
  }
};

export const deleteBot = async (id: string): Promise<boolean> => {
  try {
    // In a real implementation, this would delete from the database
    console.log('Deleted bot:', id);
    return true;
  } catch (error) {
    console.error('Error deleting bot:', error);
    return false;
  }
};

/**
 * User management functions
 */
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  // Mock implementation
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
    
    console.log('Upgraded user to VIP:', userId);
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

/**
 * Reports and feedback functions
 */
export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  // Mock implementation
  return [
    {
      id: "report-1",
      type: "report",
      userId: "user-123",
      content: "Inappropriate messages from this user",
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      resolved: false
    },
    {
      id: "feedback-1",
      type: "feedback",
      userId: "user-456",
      content: "Great app, but would like more features",
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      resolved: true
    }
  ];
};

export const addReportOrFeedback = async (
  type: 'report' | 'feedback',
  userId: string,
  content: string
): Promise<ReportFeedback | null> => {
  try {
    // Mock implementation
    const item: ReportFeedback = {
      id: `${type}-${Date.now()}`,
      type,
      userId,
      content,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      resolved: false
    };
    
    console.log(`Added ${type}:`, item);
    return item;
  } catch (error) {
    console.error(`Error adding ${type}:`, error);
    return null;
  }
};

export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  try {
    // Mock implementation
    console.log('Resolved report/feedback:', id);
    return true;
  } catch (error) {
    console.error('Error resolving report/feedback:', error);
    return false;
  }
};

export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  try {
    // Mock implementation
    console.log('Deleted report/feedback:', id);
    return true;
  } catch (error) {
    console.error('Error deleting report/feedback:', error);
    return false;
  }
};

export const cleanupExpiredReportsFeedback = async (): Promise<boolean> => {
  try {
    // Mock implementation
    console.log('Cleaned up expired reports and feedback');
    return true;
  } catch (error) {
    console.error('Error cleaning up expired reports/feedback:', error);
    return false;
  }
};
