
import { AdminAction } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

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
