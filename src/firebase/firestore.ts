
// This file now redirects all Firestore operations to Supabase
// It serves as a compatibility layer during migration

import { firestoreToSupabase } from '../lib/compatibility/firebaseToSupabase';
import { supabase } from '@/lib/supabase/supabaseClient';

// Re-export the compatibility functions to maintain the same API
export const getDocument = firestoreToSupabase.getDocument;
export const setDocument = firestoreToSupabase.setDocument;

// For backward compatibility with existing calls to these functions
export const getAllBots = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*');
  
  return data || [];
};

export const getBot = async (id: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  return data;
};

export const getBannedUsers = async () => {
  const { data } = await supabase
    .from('banned_users')
    .select('*');
  
  return data || [];
};

export const getAdminActions = async () => {
  const { data } = await supabase
    .from('admin_actions')
    .select('*');
  
  return data || [];
};

export const initializeFirestoreData = async () => {
  console.log('Initialized Supabase data');
  // No need to initialize for Supabase
  return Promise.resolve();
};

// For backward compatibility, re-export the modular structure
export * from './firestore/index';
