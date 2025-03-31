
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use the same URL and key as the client, but could be replaced with service_role key for admin operations
const supabaseUrl = "https://lvawljaqsafbjpnrwkyd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YXdsamFxc2FmYmpwbnJ3a3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjczMzgsImV4cCI6MjA1ODk0MzMzOH0.PoAP2KhiL2dUDI1Ti_SAoQiqsI8jhKIrLw_3Vra6Qls";

// Create a Supabase admin client
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Re-export Supabase admin functions
export const getAllBots = async () => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*');
  
  if (error) {
    console.error('Error getting bots:', error);
    return [];
  }
  
  return data || [];
};

export const getBot = async (id: string) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error getting bot:', error);
    return null;
  }
  
  return data;
};

export const createBot = async (botData: any) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert(botData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating bot:', error);
    return null;
  }
  
  return data;
};

export const updateBot = async (id: string, botData: any) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(botData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating bot:', error);
    return null;
  }
  
  return data;
};

export const deleteBot = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting bot:', error);
    return false;
  }
  
  return true;
};

// Banned users management
export const getBannedUsers = async () => {
  const { data, error } = await supabaseAdmin
    .from('banned_users')
    .select('*');
  
  if (error) {
    console.error('Error getting banned users:', error);
    return [];
  }
  
  return data || [];
};

export const banUser = async (userData: any) => {
  const { data, error } = await supabaseAdmin
    .from('banned_users')
    .insert(userData)
    .select()
    .single();
  
  if (error) {
    console.error('Error banning user:', error);
    return null;
  }
  
  return data;
};

export const unbanUser = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('banned_users')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
  
  return true;
};

export const isUserBanned = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('banned_users')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error checking if user is banned:', error);
    return false;
  }
  
  return data && data.length > 0;
};

// Admin actions
export const getAdminActions = async () => {
  const { data, error } = await supabaseAdmin
    .from('admin_actions')
    .select('*');
  
  if (error) {
    console.error('Error getting admin actions:', error);
    return [];
  }
  
  return data || [];
};

export const logAdminAction = async (actionData: any) => {
  const { data, error } = await supabaseAdmin
    .from('admin_actions')
    .insert(actionData)
    .select()
    .single();
  
  if (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
  
  return data;
};

// Reports and feedback
export const getReportsAndFeedback = async () => {
  const { data, error } = await supabaseAdmin
    .from('reports_feedback')
    .select('*');
  
  if (error) {
    console.error('Error getting reports and feedback:', error);
    return [];
  }
  
  return data || [];
};

export const addReportOrFeedback = async (reportData: any) => {
  const { data, error } = await supabaseAdmin
    .from('reports_feedback')
    .insert(reportData)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding report or feedback:', error);
    return null;
  }
  
  return data;
};

export const resolveReportOrFeedback = async (id: string, updateData: any) => {
  const { data, error } = await supabaseAdmin
    .from('reports_feedback')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error resolving report or feedback:', error);
    return null;
  }
  
  return data;
};

export const deleteReportOrFeedback = async (id: string) => {
  const { error } = await supabaseAdmin
    .from('reports_feedback')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting report or feedback:', error);
    return false;
  }
  
  return true;
};

export const cleanupExpiredReportsFeedback = async () => {
  const { error } = await supabaseAdmin
    .from('reports_feedback')
    .delete()
    .lt('expires', new Date().toISOString());
  
  if (error) {
    console.error('Error cleaning up expired reports and feedback:', error);
    return false;
  }
  
  return true;
};

// User management
export const kickUser = async (userId: string) => {
  // Implementation depends on your app's session management
  console.log('Kick user implementation needed');
  return true;
};

export const upgradeToVIP = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_vip: true })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error upgrading user to VIP:', error);
    return null;
  }
  
  return data;
};

export const downgradeToStandard = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_vip: false })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error downgrading user to standard:', error);
    return null;
  }
  
  return data;
};

// Initialize Supabase admin data
export const initializeSupabaseAdminData = async () => {
  console.log('Initializing Supabase admin data');
  // No initialization needed for Supabase
  return Promise.resolve();
};
