
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

// Admin dashboard stats type
export interface AdminDashboardStats {
  total_users: number;
  vip_users: number;
  active_bans: number;
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
    },
    
    getAdminUser: async (userId: string) => {
      const { data, error } = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/get_admin_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({ p_user_id: userId })
      }).then(res => res.json());
      
      return { data: data as AdminUser, error };
    },
    
    updateLastLogin: async (userId: string) => {
      const { data, error } = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/update_admin_last_login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({ p_user_id: userId })
      }).then(res => res.json());
      
      return { data, error };
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
    },
    
    logAction: async (params: {
      admin_id: string;
      action_type: string;
      target_id?: string;
      target_type?: string;
      reason?: string;
      duration?: string;
    }) => {
      const { data, error } = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/log_admin_action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          p_admin_id: params.admin_id,
          p_action_type: params.action_type,
          p_target_id: params.target_id || null,
          p_target_type: params.target_type || null,
          p_reason: params.reason || null,
          p_duration: params.duration || null
        })
      }).then(res => res.json());
      
      return { data: data as AdminAction, error };
    },
    
    getAdminActions: async () => {
      const { data, error } = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/get_admin_actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        }
      }).then(res => res.json());
      
      return { data: data as AdminAction[], error };
    }
  }),
  
  // Dashboard stats queries
  dashboard: () => ({
    getStats: async () => {
      const { data, error } = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/get_admin_dashboard_stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        }
      }).then(res => res.json());
      
      return { data: data as AdminDashboardStats, error };
    }
  })
};
