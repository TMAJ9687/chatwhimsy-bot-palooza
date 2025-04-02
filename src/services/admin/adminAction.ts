
import { supabase } from '@/integrations/supabase/client';
import { AdminAction, AdminActionType } from '@/types/admin';
import * as adminAuth from '@/services/admin/adminAuth';

/**
 * Get all admin actions
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
    
    return data || [];
  } catch (error) {
    console.error('Error in getAdminActions:', error);
    return [];
  }
};

/**
 * Log admin action
 */
export const logAdminAction = async (
  actionType: AdminActionType,
  targetId: string,
  targetType: string,
  reason?: string,
  duration?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_actions')
      .insert({
        action_type: actionType,
        target_id: targetId,
        target_type: targetType,
        reason,
        duration,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging admin action:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in logAdminAction:', error);
    return false;
  }
};
