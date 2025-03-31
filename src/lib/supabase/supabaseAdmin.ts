
import { supabase } from './supabaseClient';
import { AdminAction, BanRecord, ReportFeedback } from '@/types/admin';
import { Bot } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

/**
 * Admin data service for Supabase
 * Replaces the Firebase admin service with Supabase equivalent
 */

// Bot Management
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    // Get bots data from Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
      
    if (error) {
      console.error('Error getting bots from Supabase:', error);
      throw error;
    }
    
    // Transform to Bot interface
    return data.map(profile => ({
      id: profile.id,
      name: profile.nickname || profile.display_name || 'User',
      avatar: profile.avatar_url || '',
      gender: profile.gender || 'other',
      age: profile.age || 25,
      country: profile.country || 'Unknown',
      interests: profile.interests || [],
      vip: profile.is_admin || false, // VIPs are admin users in this case
      about: profile.bio || '',
      personalityTraits: [] 
    }));
  } catch (error) {
    console.error('Error getting all bots:', error);
    return [];
  }
};

export const getBot = async (id: string): Promise<Bot | undefined> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error getting bot:', error);
      return undefined;
    }
    
    return {
      id: data.id,
      name: data.nickname || data.display_name || 'User',
      avatar: data.avatar_url || '',
      gender: data.gender || 'other',
      age: data.age || 25,
      country: data.country || 'Unknown',
      interests: data.interests || [],
      vip: data.is_admin || false,
      about: data.bio || '',
      personalityTraits: []
    };
  } catch (error) {
    console.error('Error getting bot:', error);
    return undefined;
  }
};

export const createBot = async (bot: Omit<Bot, 'id'>): Promise<Bot> => {
  try {
    const newBotId = `bot-${uuidv4().slice(0, 8)}`;
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: newBotId,
        nickname: bot.name,
        display_name: bot.name,
        gender: bot.gender,
        age: bot.age,
        country: bot.country,
        bio: bot.about,
        avatar_url: bot.avatar,
        interests: bot.interests,
        is_admin: bot.vip
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating bot:', error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.nickname || data.display_name,
      avatar: data.avatar_url || '',
      gender: data.gender || 'other',
      age: data.age || 25,
      country: data.country || 'Unknown',
      interests: data.interests || [],
      vip: data.is_admin || false,
      about: data.bio || '',
      personalityTraits: []
    };
  } catch (error) {
    console.error('Error creating bot:', error);
    throw error;
  }
};

export const updateBot = async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        nickname: updates.name,
        display_name: updates.name,
        gender: updates.gender,
        age: updates.age,
        country: updates.country,
        bio: updates.about,
        avatar_url: updates.avatar,
        interests: updates.interests,
        is_admin: updates.vip
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating bot:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.nickname || data.display_name,
      avatar: data.avatar_url || '',
      gender: data.gender || 'other',
      age: data.age || 25,
      country: data.country || 'Unknown',
      interests: data.interests || [],
      vip: data.is_admin || false,
      about: data.bio || '',
      personalityTraits: []
    };
  } catch (error) {
    console.error('Error updating bot:', error);
    return null;
  }
};

export const deleteBot = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting bot:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting bot:', error);
    return false;
  }
};

// Admin Actions
export const getAdminActions = async (): Promise<AdminAction[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_actions')
      .select('*');
      
    if (error) {
      console.error('Error getting admin actions:', error);
      return [];
    }
    
    return data.map(action => ({
      ...action,
      timestamp: new Date(action.timestamp)
    }));
  } catch (error) {
    console.error('Error getting admin actions:', error);
    return [];
  }
};

export const logAdminAction = async (action: AdminAction): Promise<AdminAction> => {
  try {
    const { data, error } = await supabase
      .from('admin_actions')
      .insert({
        ...action,
        id: action.id || uuidv4(),
        timestamp: action.timestamp.toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error logging admin action:', error);
      return action;
    }
    
    return {
      ...data,
      timestamp: new Date(data.timestamp)
    };
  } catch (error) {
    console.error('Error logging admin action:', error);
    return action;
  }
};

// Ban Management
export const getBannedUsers = async (): Promise<BanRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('banned_users')
      .select('*');
      
    if (error) {
      console.error('Error getting banned users:', error);
      return [];
    }
    
    return data.map(ban => ({
      ...ban,
      timestamp: new Date(ban.timestamp),
      expiresAt: ban.expiresAt ? new Date(ban.expiresAt) : undefined
    }));
  } catch (error) {
    console.error('Error getting banned users:', error);
    return [];
  }
};

export const banUser = async (banRecord: Omit<BanRecord, 'id' | 'timestamp'>): Promise<BanRecord> => {
  try {
    const now = new Date();
    const newBan = {
      ...banRecord,
      id: uuidv4(),
      timestamp: now.toISOString(),
      expiresAt: banRecord.expiresAt ? banRecord.expiresAt.toISOString() : null
    };
    
    const { data, error } = await supabase
      .from('banned_users')
      .insert(newBan)
      .select()
      .single();
      
    if (error) {
      console.error('Error banning user:', error);
      throw error;
    }
    
    // Log the admin action
    await logAdminAction({
      id: uuidv4(),
      actionType: 'ban',
      targetId: banRecord.identifier,
      targetType: banRecord.identifierType,
      reason: banRecord.reason,
      duration: banRecord.duration,
      timestamp: now,
      adminId: banRecord.adminId
    });
    
    return {
      ...data,
      timestamp: new Date(data.timestamp),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
    };
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

export const unbanUser = async (id: string, adminId: string): Promise<boolean> => {
  try {
    // Get the ban record first
    const { data: banData, error: fetchError } = await supabase
      .from('banned_users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching ban record:', fetchError);
      return false;
    }
    
    // Delete the ban
    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error unbanning user:', error);
      return false;
    }
    
    // Log admin action
    await logAdminAction({
      id: uuidv4(),
      actionType: 'unban',
      targetId: banData.identifier,
      targetType: banData.identifierType,
      timestamp: new Date(),
      adminId: adminId
    });
    
    return true;
  } catch (error) {
    console.error('Error unbanning user:', error);
    return false;
  }
};

export const isUserBanned = async (identifier: string): Promise<BanRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('banned_users')
      .select('*')
      .eq('identifier', identifier)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return null;
      }
      console.error('Error checking if user is banned:', error);
      return null;
    }
    
    // Check if ban has expired
    const ban = {
      ...data,
      timestamp: new Date(data.timestamp),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
    };
    
    if (ban.expiresAt && new Date() > ban.expiresAt) {
      // Remove expired ban
      await supabase
        .from('banned_users')
        .delete()
        .eq('id', ban.id);
        
      return null;
    }
    
    return ban;
  } catch (error) {
    console.error('Error checking if user is banned:', error);
    return null;
  }
};

// Reports and Feedback
export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  try {
    // Clean up expired items first
    await cleanupExpiredReportsFeedback();
    
    const { data, error } = await supabase
      .from('reports_feedback')
      .select('*');
      
    if (error) {
      console.error('Error getting reports and feedback:', error);
      return [];
    }
    
    return data.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp),
      expiresAt: new Date(item.expiresAt)
    }));
  } catch (error) {
    console.error('Error getting reports and feedback:', error);
    return [];
  }
};

export const addReportOrFeedback = async (
  type: 'report' | 'feedback', 
  userId: string, 
  content: string
): Promise<ReportFeedback> => {
  try {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const item = {
      id: uuidv4(),
      type,
      userId,
      content,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      resolved: false
    };
    
    const { data, error } = await supabase
      .from('reports_feedback')
      .insert(item)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding report or feedback:', error);
      throw error;
    }
    
    return {
      ...data,
      timestamp: new Date(data.timestamp),
      expiresAt: new Date(data.expiresAt)
    };
  } catch (error) {
    console.error('Error adding report or feedback:', error);
    throw error;
  }
};

export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports_feedback')
      .update({ resolved: true })
      .eq('id', id);
      
    if (error) {
      console.error('Error resolving report or feedback:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error resolving report or feedback:', error);
    return false;
  }
};

export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports_feedback')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting report or feedback:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting report or feedback:', error);
    return false;
  }
};

export const cleanupExpiredReportsFeedback = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('reports_feedback')
      .delete()
      .lt('expiresAt', now);
      
    if (error) {
      console.error('Error cleaning up expired reports and feedback:', error);
    }
  } catch (error) {
    console.error('Error cleaning up expired reports and feedback:', error);
  }
};

// User Management
export const kickUser = async (userId: string, adminId: string): Promise<AdminAction> => {
  const action: AdminAction = {
    id: uuidv4(),
    actionType: 'kick',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  };
  
  return await logAdminAction(action);
};

export const upgradeToVIP = async (
  userId: string, 
  adminId: string, 
  duration: string = 'Lifetime'
): Promise<AdminAction> => {
  // Update user's VIP status
  await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', userId);
  
  const action: AdminAction = {
    id: uuidv4(),
    actionType: 'upgrade',
    targetId: userId,
    targetType: 'user',
    duration: duration,
    timestamp: new Date(),
    adminId: adminId
  };
  
  return await logAdminAction(action);
};

export const downgradeToStandard = async (userId: string, adminId: string): Promise<AdminAction> => {
  // Update user's VIP status
  await supabase
    .from('profiles')
    .update({ is_admin: false })
    .eq('id', userId);
  
  const action: AdminAction = {
    id: uuidv4(),
    actionType: 'downgrade',
    targetId: userId,
    targetType: 'user',
    timestamp: new Date(),
    adminId: adminId
  };
  
  return await logAdminAction(action);
};

// Initialize admin service
export const initializeSupabaseAdminData = async (): Promise<void> => {
  console.log('Initializing Supabase admin data...');
  // Make sure the tables exist, if not, we'll set them up
  
  return Promise.resolve();
};
