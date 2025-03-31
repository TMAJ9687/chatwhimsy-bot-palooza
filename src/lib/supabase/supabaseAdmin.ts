import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { ensureAdminTables, createRequiredTables } from '@/utils/migrationUtils';
import type { Bot } from '@/types/chat';

// Create a Supabase client with admin rights
// Get the Supabase URL and service key from the environment variables
const supabaseUrl = "https://lvawljaqsafbjpnrwkyd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YXdsamFxc2FmYmpwbnJ3a3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjczMzgsImV4cCI6MjA1ODk0MzMzOH0.PoAP2KhiL2dUDI1Ti_SAoQiqsI8jhKIrLw_3Vra6Qls";

// Check if URL is available before creating client
if (!supabaseUrl) {
  console.error("Supabase URL is missing");
}

if (!supabaseServiceKey) {
  console.error("Supabase service key is missing");
}

// Create the Supabase admin client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialize admin data in Supabase
export const initializeSupabaseAdminData = async () => {
  try {
    // Create required tables if they don't exist
    await createRequiredTables();
    
    // Ensure admin profile exists
    await ensureAdminTables();
    
    console.log('Supabase admin data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Supabase admin data:', error);
    return false;
  }
};

// Get all bots
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('is_bot', true);
    
    if (error) throw error;
    
    // Transform data to match Bot type
    const bots: Bot[] = data.map(item => ({
      id: item.id,
      name: item.name || item.display_name,
      avatar: item.avatar_url,
      gender: item.gender,
      age: item.age,
      country: item.country,
      countryCode: item.country_code || 'US',
      interests: item.interests || [],
      vip: item.is_vip || false,
      responses: item.responses || [],
      personalityTraits: item.personality_traits || []
    }));
    
    console.log('Loaded', bots.length, 'bots');
    return bots;
  } catch (error) {
    console.error('Error getting all bots:', error);
    return [];
  }
};

// Get a specific bot
export const getBot = async (id: string): Promise<Bot | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('is_bot', true)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name || data.display_name,
      avatar: data.avatar_url,
      gender: data.gender,
      age: data.age,
      country: data.country,
      countryCode: data.country_code || 'US',
      interests: data.interests || [],
      vip: data.is_vip || false,
      responses: data.responses || [],
      personalityTraits: data.personality_traits || []
    };
  } catch (error) {
    console.error('Error getting bot:', error);
    return null;
  }
};

// Create a new bot
export const createBot = async (bot: Omit<Bot, 'id'>): Promise<string | null> => {
  try {
    const id = uuidv4();
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id,
        name: bot.name,
        display_name: bot.name,
        avatar_url: bot.avatar,
        gender: bot.gender,
        age: bot.age,
        country: bot.country,
        country_code: bot.countryCode,
        interests: bot.interests,
        is_vip: bot.vip,
        is_bot: true,
        responses: bot.responses || [],
        personality_traits: bot.personalityTraits || []
      });
    
    if (error) throw error;
    
    return id;
  } catch (error) {
    console.error('Error creating bot:', error);
    return null;
  }
};

// Update an existing bot
export const updateBot = async (id: string, bot: Partial<Bot>): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        name: bot.name,
        display_name: bot.name,
        avatar_url: bot.avatar,
        gender: bot.gender,
        age: bot.age,
        country: bot.country,
        country_code: bot.countryCode,
        interests: bot.interests,
        is_vip: bot.vip,
        responses: bot.responses,
        personality_traits: bot.personalityTraits
      })
      .eq('id', id)
      .eq('is_bot', true);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating bot:', error);
    return false;
  }
};

// Delete a bot
export const deleteBot = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('is_bot', true);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting bot:', error);
    return false;
  }
};

// Get all banned users
export const getBannedUsers = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banned_users')
      .select('*');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting banned users:', error);
    return [];
  }
};

// Ban a user
export const banUser = async (userId: string, reason: string, duration: string) => {
  try {
    const id = uuidv4();
    const now = new Date();
    let expiresAt = null;
    
    if (duration !== 'permanent') {
      const days = parseInt(duration.split(' ')[0]);
      expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }
    
    const { error } = await supabaseAdmin
      .from('banned_users')
      .insert({
        id,
        identifier: userId,
        identifier_type: 'user_id',
        reason,
        duration,
        timestamp: now.toISOString(),
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        admin_id: 'admin' // Get from auth context in a real app
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error banning user:', error);
    return false;
  }
};

// Unban a user
export const unbanUser = async (id: string) => {
  try {
    const { error } = await supabaseAdmin
      .from('banned_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
};

// Check if a user is banned
export const isUserBanned = async (userId: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banned_users')
      .select('*')
      .eq('identifier', userId)
      .eq('identifier_type', 'user_id');
    
    if (error) throw error;
    
    if (!data || data.length === 0) return false;
    
    // Check if any ban is still active
    const now = new Date();
    for (const ban of data) {
      if (!ban.expires_at || new Date(ban.expires_at) > now) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if user is banned:', error);
    return false;
  }
};

// Get all admin actions
export const getAdminActions = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_actions')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting admin actions:', error);
    return [];
  }
};

// Log an admin action
export const logAdminAction = async (actionType: string, targetId: string, targetType: string, reason?: string) => {
  try {
    const id = uuidv4();
    
    const { error } = await supabaseAdmin
      .from('admin_actions')
      .insert({
        id,
        action_type: actionType,
        target_id: targetId,
        target_type: targetType,
        reason,
        timestamp: new Date().toISOString(),
        admin_id: 'admin' // Get from auth context in a real app
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error logging admin action:', error);
    return false;
  }
};

// Get all reports and feedback
export const getReportsAndFeedback = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports_feedback')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting reports and feedback:', error);
    return [];
  }
};

// Add a report or feedback
export const addReportOrFeedback = async (type: string, userId: string, content: string) => {
  try {
    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const { error } = await supabaseAdmin
      .from('reports_feedback')
      .insert({
        id,
        type,
        user_id: userId,
        content,
        timestamp: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        resolved: false
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding report or feedback:', error);
    return false;
  }
};

// Resolve a report or feedback
export const resolveReportOrFeedback = async (id: string) => {
  try {
    const { error } = await supabaseAdmin
      .from('reports_feedback')
      .update({ resolved: true })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error resolving report or feedback:', error);
    return false;
  }
};

// Delete a report or feedback
export const deleteReportOrFeedback = async (id: string) => {
  try {
    const { error } = await supabaseAdmin
      .from('reports_feedback')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting report or feedback:', error);
    return false;
  }
};

// Cleanup expired reports and feedback
export const cleanupExpiredReportsFeedback = async () => {
  try {
    const now = new Date();
    
    const { error } = await supabaseAdmin
      .from('reports_feedback')
      .delete()
      .lt('expires_at', now.toISOString());
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error cleaning up expired reports and feedback:', error);
    return false;
  }
};

// User management functions
export const kickUser = async (userId: string, reason: string) => {
  // In a real app, this would invalidate user sessions
  return await logAdminAction('kick', userId, 'user', reason);
};

export const upgradeToVIP = async (userId: string) => {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_vip: true })
      .eq('id', userId);
    
    if (error) throw error;
    
    await logAdminAction('upgrade_to_vip', userId, 'user');
    
    return true;
  } catch (error) {
    console.error('Error upgrading user to VIP:', error);
    return false;
  }
};

export const downgradeToStandard = async (userId: string) => {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_vip: false })
      .eq('id', userId);
    
    if (error) throw error;
    
    await logAdminAction('downgrade_to_standard', userId, 'user');
    
    return true;
  } catch (error) {
    console.error('Error downgrading user to standard:', error);
    return false;
  }
};
