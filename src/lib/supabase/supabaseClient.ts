
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// We have hardcoded credentials in src/integrations/supabase/client.ts, so we'll use those
// instead of relying on environment variables
const supabaseUrl = "https://lvawljaqsafbjpnrwkyd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YXdsamFxc2FmYmpwbnJ3a3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjczMzgsImV4cCI6MjA1ODk0MzMzOH0.PoAP2KhiL2dUDI1Ti_SAoQiqsI8jhKIrLw_3Vra6Qls";

// Create the Supabase client with improved error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper to check if Supabase is available and properly configured
export const isSupabaseAvailable = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
