
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client with service role key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://lvawljaqsafbjpnrwkyd.supabase.co";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Create the Supabase admin client
const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Mock admin service functions for TypeScript compatibility
// These functions will be replaced with actual implementations later
const supabaseAdmin = {
  getAllBots: async () => [],
  getBot: async () => null,
  createBot: async () => ({ id: '' }),
  updateBot: async () => ({ id: '' }),
  deleteBot: async () => true,

  getBannedUsers: async () => [],
  banUser: async () => ({ id: '' }),
  unbanUser: async () => true,
  isUserBanned: async () => false,

  getAdminActions: async () => [],
  logAdminAction: async () => ({ id: '' }),

  getReportsAndFeedback: async () => [],
  addReportOrFeedback: async () => ({ id: '' }),
  resolveReportOrFeedback: async () => true,
  deleteReportOrFeedback: async () => true,
  cleanupExpiredReportsFeedback: async () => true,

  kickUser: async () => true,
  upgradeToVIP: async () => true,
  downgradeToStandard: async () => true,
  initializeSupabaseAdminData: async () => true
};

export { supabaseAdmin };
export default supabaseAdmin;
