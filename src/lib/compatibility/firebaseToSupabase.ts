
import { supabase } from '@/lib/supabase/supabaseClient';

/**
 * Compatibility layer to map Firebase functions to Supabase
 * This helps with the migration from Firebase to Supabase
 */

// Auth compatibility
export const firebaseAuthToSupabase = {
  onAuthStateChanged: (callback: any) => {
    // Use Supabase auth state change listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    
    // Return unsubscribe function
    return data.subscription.unsubscribe;
  },
  
  signOut: async () => {
    return supabase.auth.signOut();
  },
  
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
};

// Firestore compatibility
export const firestoreToSupabase = {
  getDocument: async (collection: string, id: string) => {
    const { data, error } = await supabase
      .from(collection)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  setDocument: async (collection: string, id: string, data: any) => {
    const { error } = await supabase
      .from(collection)
      .upsert({ id, ...data })
      .eq('id', id);
      
    if (error) throw error;
    return { id };
  }
};

// Storage compatibility
export const storageToSupabase = {
  uploadFile: async (path: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);
      
    if (error) throw error;
    
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  },
  
  getDownloadURL: async (path: string) => {
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(path);
      
    return data.publicUrl;
  }
};
