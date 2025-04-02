
// Custom type definitions for admin tables
import { Json } from './types';

// Admin user type
export interface AdminUser {
  id: string;
  email: string;
  display_name?: string;
  created_at?: string;
  last_login?: string;
}

// Admin action type
export interface AdminAction {
  id: string;
  admin_id?: string;
  action_type: string;
  target_id?: string;
  target_type?: string;
  reason?: string;
  duration?: string;
  timestamp?: string;
}

// Helper methods for type safety when working with admin tables
export const adminDb = {
  // Type-safe admin users queries
  adminUsers: () => ({
    select: async () => {
      const { data, error } = await fetch(`${process.env.SUPABASE_URL}/rest/v1/admin_users?select=*`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        }
      }).then(res => res.json());
      
      return { data: data as AdminUser[], error };
    }
  }),
  // Type-safe admin actions queries  
  adminActions: () => ({
    select: async () => {
      const { data, error } = await fetch(`${process.env.SUPABASE_URL}/rest/v1/admin_actions?select=*`, {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        }
      }).then(res => res.json());
      
      return { data: data as AdminAction[], error };
    }
  })
};
