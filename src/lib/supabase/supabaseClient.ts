
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Get Supabase URL and anon key from the hardcoded values
const supabaseUrl = "https://lvawljaqsafbjpnrwkyd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YXdsamFxc2FmYmpwbnJ3a3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjczMzgsImV4cCI6MjA1ODk0MzMzOH0.PoAP2KhiL2dUDI1Ti_SAoQiqsI8jhKIrLw_3Vra6Qls";

// Create the Supabase client with improved configuration for auth
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

// Helper to check if Supabase is available and properly configured
export const isSupabaseAvailable = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Create a simple Supabase status checker function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // A simple query to check connection
    const { error } = await supabase
      .from('site_settings')
      .select('site_name')
      .limit(1);
      
    return !error;
  } catch (e) {
    console.error('Error checking Supabase connection:', e);
    return false;
  }
};
