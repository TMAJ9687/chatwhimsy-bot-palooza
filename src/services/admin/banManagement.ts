
import { supabase } from '@/integrations/supabase/client';
import { Ban, BanReason } from '@/types/admin';

/**
 * Get all bans
 */
export const getAllBans = async (): Promise<Ban[]> => {
  try {
    const { data, error } = await supabase
      .from('user_bans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bans:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllBans:', error);
    return [];
  }
};

/**
 * Ban a user
 */
export const banUser = async (
  userId: string, 
  reason: BanReason, 
  expiresAt?: Date
): Promise<boolean> => {
  try {
    // Create ban record
    const banData = {
      user_id: userId,
      reason,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      created_at: new Date().toISOString()
    };
    
    const { error: banError } = await supabase
      .from('user_bans')
      .insert([banData]);
    
    if (banError) {
      console.error('Error creating ban record:', banError);
      return false;
    }
    
    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({ status: 'banned' })
      .eq('id', userId);
    
    if (userError) {
      console.error('Error updating user status:', userError);
      // Try to revert ban
      await supabase
        .from('user_bans')
        .delete()
        .eq('user_id', userId)
        .eq('created_at', banData.created_at);
        
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in banUser:', error);
    return false;
  }
};

/**
 * Unban a user
 */
export const unbanUser = async (userId: string): Promise<boolean> => {
  try {
    // Delete all ban records for user
    const { error: banError } = await supabase
      .from('user_bans')
      .delete()
      .eq('user_id', userId);
    
    if (banError) {
      console.error('Error removing ban records:', banError);
      return false;
    }
    
    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', userId);
    
    if (userError) {
      console.error('Error updating user status:', userError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in unbanUser:', error);
    return false;
  }
};

/**
 * Check if user is banned
 */
export const isUserBanned = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_bans')
      .select('*')
      .eq('user_id', userId)
      .is('expires_at', null)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking ban status:', error);
      return false;
    }
    
    // If we have permanent ban data, user is banned
    if (data) return true;
    
    // Check for temporary bans that haven't expired
    const now = new Date().toISOString();
    const { data: tempBan, error: tempError } = await supabase
      .from('user_bans')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', now)
      .single();
    
    if (tempError && tempError.code !== 'PGRST116') {
      console.error('Error checking temporary ban status:', tempError);
      return false;
    }
    
    return !!tempBan;
  } catch (error) {
    console.error('Error in isUserBanned:', error);
    return false;
  }
};
