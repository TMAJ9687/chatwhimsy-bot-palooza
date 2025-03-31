
import { useState, useCallback } from 'react';
import { BanRecord } from '@/types/admin';
import { toast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

export const useAdminUsers = () => {
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBannedUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading banned users data...');
      
      // Get banned users from Supabase
      const { data, error } = await supabaseAdmin
        .from('banned_users')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} banned users`);
      setBannedUsers(data || []);
    } catch (error) {
      console.error('Error getting banned users:', error);
      toast({
        title: "Error loading banned users",
        description: "There was a problem loading the banned users data.",
        variant: "destructive"
      });
      setBannedUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const banUser = useCallback(async (userData: Omit<BanRecord, 'id'>): Promise<BanRecord | null> => {
    try {
      // Add user to Supabase
      const { data, error } = await supabaseAdmin
        .from('banned_users')
        .insert([{
          ...userData,
          // Ensure timestamp is a string
          timestamp: typeof userData.timestamp === 'object' ? 
            (userData.timestamp as Date).toISOString() : 
            userData.timestamp
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Update local state
        setBannedUsers(prev => [...prev, data[0] as BanRecord]);
        
        toast({
          title: "User banned",
          description: `User has been banned successfully.`
        });
        
        return data[0] as BanRecord;
      }
      
      throw new Error('No data returned from ban operation');
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error banning user",
        description: "There was a problem banning the user.",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const unbanUser = useCallback(async (banId: string): Promise<boolean> => {
    try {
      // Make sure banId is a string, not a number
      const banIdString = String(banId);
      
      // Delete from Supabase
      const { error } = await supabaseAdmin
        .from('banned_users')
        .delete()
        .eq('id', banIdString);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setBannedUsers(prev => prev.filter(ban => ban.id !== banIdString));
      
      toast({
        title: "User unbanned",
        description: "The user has been unbanned successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error unbanning user",
        description: "There was a problem unbanning the user.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  return {
    bannedUsers,
    loading,
    loadBannedUsers,
    banUser,
    unbanUser
  };
};
