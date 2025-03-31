
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client with service role key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Mock admin service functions for TypeScript compatibility
supabaseAdmin.getAllBots = async () => [];
supabaseAdmin.getBot = async () => null;
supabaseAdmin.createBot = async () => ({ id: '' });
supabaseAdmin.updateBot = async () => ({ id: '' });
supabaseAdmin.deleteBot = async () => true;

supabaseAdmin.getBannedUsers = async () => [];
supabaseAdmin.banUser = async () => ({ id: '' });
supabaseAdmin.unbanUser = async () => true;
supabaseAdmin.isUserBanned = async () => false;

supabaseAdmin.getAdminActions = async () => [];
supabaseAdmin.logAdminAction = async () => ({ id: '' });

supabaseAdmin.getReportsAndFeedback = async () => [];
supabaseAdmin.addReportOrFeedback = async () => ({ id: '' });
supabaseAdmin.resolveReportOrFeedback = async () => true;
supabaseAdmin.deleteReportOrFeedback = async () => true;
supabaseAdmin.cleanupExpiredReportsFeedback = async () => true;

supabaseAdmin.kickUser = async () => true;
supabaseAdmin.upgradeToVIP = async () => true;
supabaseAdmin.downgradeToStandard = async () => true;
supabaseAdmin.initializeSupabaseAdminData = async () => true;

export default supabaseAdmin;
