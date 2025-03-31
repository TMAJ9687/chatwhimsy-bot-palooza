
import { createClient } from '@supabase/supabase-js';
import { AdminAction } from '@/firebase/firestore/adminActionCollection';
import { BanRecord } from '@/firebase/firestore/banCollection';
import { ReportRecord } from '@/firebase/firestore/reportCollection';

// Create Supabase admin client with service role key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Create the Supabase admin client
const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Implement mock admin service functions for TypeScript compatibility
const getAllBots = async () => [] as any[];
const getBot = async () => null;
const createBot = async () => ({ id: '' });
const updateBot = async () => ({ id: '' });
const deleteBot = async () => true;

const getBannedUsers = async () => [] as BanRecord[];
const banUser = async (data: Omit<BanRecord, 'id'>) => ({ id: '', ...data } as BanRecord);
const unbanUser = async () => true;
const isUserBanned = async () => false;

const getAdminActions = async () => [] as AdminAction[];
const logAdminAction = async (action: Omit<AdminAction, 'id' | 'timestamp'>) => {
  const id = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().toISOString();
  return { id, timestamp, ...action } as AdminAction;
};

const getReportsAndFeedback = async () => [] as ReportRecord[];
const addReportOrFeedback = async (data: Partial<ReportRecord>) => ({ id: '', ...data } as ReportRecord);
const resolveReportOrFeedback = async () => true;
const deleteReportOrFeedback = async () => true;
const cleanupExpiredReportsFeedback = async () => true;

const kickUser = async () => true;
const upgradeToVIP = async () => true;
const downgradeToStandard = async () => true;
const initializeSupabaseAdminData = async () => true;

// Provide "from" method for compatibility with useAdminBots and other hooks
const from = (table: string) => ({
  select: () => ({
    eq: async () => ({ data: [] }),
    order: () => ({
      eq: async () => ({ data: [] })
    })
  }),
  insert: () => ({
    select: () => ({
      single: async () => ({ data: null, error: null })
    })
  }),
  update: () => ({
    eq: async () => ({ data: null, error: null }),
    match: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null })
      })
    })
  }),
  delete: () => ({
    eq: async () => ({ error: null })
  })
});

// Export these functions as part of the supabaseAdmin object
const supabaseAdmin = {
  getAllBots,
  getBot,
  createBot,
  updateBot,
  deleteBot,

  getBannedUsers,
  banUser,
  unbanUser,
  isUserBanned,

  getAdminActions,
  logAdminAction,

  getReportsAndFeedback,
  addReportOrFeedback,
  resolveReportOrFeedback,
  deleteReportOrFeedback,
  cleanupExpiredReportsFeedback,

  kickUser,
  upgradeToVIP,
  downgradeToStandard,
  initializeSupabaseAdminData,
  
  // Add from method for compatibility with useAdminBots
  from
};

export { supabaseAdmin };
export default supabaseAdmin;
