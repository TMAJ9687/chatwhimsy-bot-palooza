// Custom type definitions for admin tables

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

// Helper to get the API URL and headers
const getApiConfig = () => {
  // Use the supabase client configuration instead of process.env
  const apiUrl = "https://lvawljaqsafbjpnrwkyd.supabase.co";
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YXdsamFxc2FmYmpwbnJ3a3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjczMzgsImV4cCI6MjA1ODk0MzMzOH0.PoAP2KhiL2dUDI1Ti_SAoQiqsI8jhKIrLw_3Vra6Qls";
  
  const headers = {
    'Content-Type': 'application/json',
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  };
  
  return { apiUrl, headers };
};

// Helper methods for type safety when working with admin tables via direct API calls
export const adminDb = {
  // Type-safe admin users queries
  adminUsers: () => ({
    select: async () => {
      try {
        const { apiUrl, headers } = getApiConfig();
        const response = await fetch(`${apiUrl}/rest/v1/admin_users?select=*`, { headers });
        
        if (!response.ok) {
          throw new Error(`Error fetching admin users: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data: data as AdminUser[], error: null };
      } catch (error) {
        console.error('Error in adminUsers.select:', error);
        return { data: null, error };
      }
    },
    
    getAdminUser: async (userId: string) => {
      try {
        const { apiUrl, headers } = getApiConfig();
        const response = await fetch(`${apiUrl}/rest/v1/admin_users?id=eq.${userId}`, { headers });
        
        if (!response.ok) {
          throw new Error(`Error fetching admin user: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data: data?.[0] || null, error: null };
      } catch (error) {
        console.error('Error in adminUsers.getAdminUser:', error);
        return { data: null, error };
      }
    },
    
    updateLastLogin: async (userId: string) => {
      try {
        const { apiUrl, headers } = getApiConfig();
        const response = await fetch(`${apiUrl}/rest/v1/admin_users?id=eq.${userId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ last_login: new Date().toISOString() })
        });
        
        if (!response.ok) {
          throw new Error(`Error updating admin last login: ${response.statusText}`);
        }
        
        return { data: true, error: null };
      } catch (error) {
        console.error('Error in adminUsers.updateLastLogin:', error);
        return { data: null, error };
      }
    }
  }),
  
  // Type-safe admin actions queries  
  adminActions: () => ({
    select: async () => {
      try {
        const { apiUrl, headers } = getApiConfig();
        const response = await fetch(`${apiUrl}/rest/v1/admin_actions?select=*`, { headers });
        
        if (!response.ok) {
          throw new Error(`Error fetching admin actions: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data: data as AdminAction[], error: null };
      } catch (error) {
        console.error('Error in adminActions.select:', error);
        return { data: null, error };
      }
    },
    
    logAction: async (params: {
      admin_id: string;
      action_type: string;
      target_id?: string;
      target_type?: string;
      reason?: string;
      duration?: string;
    }) => {
      try {
        const { apiUrl, headers } = getApiConfig();
        const response = await fetch(`${apiUrl}/rest/v1/admin_actions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            admin_id: params.admin_id,
            action_type: params.action_type,
            target_id: params.target_id || null,
            target_type: params.target_type || null,
            reason: params.reason || null,
            duration: params.duration || null,
            timestamp: new Date().toISOString()
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error logging admin action: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data: data as AdminAction, error: null };
      } catch (error) {
        console.error('Error in adminActions.logAction:', error);
        return { data: null, error };
      }
    },
    
    getAdminActions: async () => {
      try {
        const { apiUrl, headers } = getApiConfig();
        const response = await fetch(`${apiUrl}/rest/v1/admin_actions?select=*&order=timestamp.desc`, { headers });
        
        if (!response.ok) {
          throw new Error(`Error fetching admin actions: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { data: data as AdminAction[], error: null };
      } catch (error) {
        console.error('Error in adminActions.getAdminActions:', error);
        return { data: null, error };
      }
    }
  }),
  
  // Dashboard stats queries
  dashboard: () => ({
    getStats: async () => {
      try {
        // Since we're not using an RPC function, we'll simulate the stats
        // In a real app, this would be replaced with an actual endpoint
        const mockStats = {
          total_users: 100,
          vip_users: 25,
          active_bans: 5
        };
        
        return { data: mockStats as AdminDashboardStats, error: null };
      } catch (error) {
        console.error('Error in dashboard.getStats:', error);
        return { data: null, error };
      }
    }
  })
};
