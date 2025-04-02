
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};

/**
 * Update user
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUser:', error);
    return false;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // First delete associated user data (depends on your db schema)
    try {
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Error deleting user preferences:', err);
      // Continue anyway
    }
    
    // Delete the user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return false;
  }
};

/**
 * Get user details
 */
export const getUserDetails = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    return null;
  }
};
