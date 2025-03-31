
// This file now redirects all Firestore operations to Supabase
// It serves as a compatibility layer during migration

import { firestoreToSupabase } from '../lib/compatibility/firebaseToSupabase';

// Re-export the compatibility functions to maintain the same API
export const getDocument = firestoreToSupabase.getDocument;
export const setDocument = firestoreToSupabase.setDocument;

// For backward compatibility, re-export the modular structure
export * from './firestore/index';
