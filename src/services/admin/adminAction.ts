
import { AdminAction } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import * as supabaseAdminAuth from './supabaseAdminAuth';

/**
 * Get all admin actions
 */
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    // First try to get from Supabase
    return await supabaseAdminAuth.getAdminActions();
  } catch (error) {
    console.error('Error getting admin actions, using empty array:', error);
    return [];
  }
};

/**
 * Log an admin action
 */
export const logAdminAction = async (action: Omit<AdminAction, 'id'>): Promise<AdminAction | null> => {
  // Try to log using Supabase
  return await supabaseAdminAuth.logAdminAction(action);
};
