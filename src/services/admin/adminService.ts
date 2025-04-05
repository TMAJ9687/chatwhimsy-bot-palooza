
import { supabase } from '@/integrations/supabase/client';
import { AdminAction, ReportFeedback } from '@/types/admin';

// Re-export functions from other service files
export * from './userService';
export * from './botService';

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
