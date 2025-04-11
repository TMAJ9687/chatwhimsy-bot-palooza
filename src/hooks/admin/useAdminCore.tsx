
import { useState, useEffect } from 'react';
import { useAdminAuth } from './useAdminAuth';
import { Bot } from '@/types/chat';
import { AdminAction } from '@/types/admin';

/**
 * Core admin hook with essential state and authentication
 */
export const useAdminCore = () => {
  // Core admin state
  const [bots, setBots] = useState<Bot[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  // Auth hook provides authentication state and functions
  const { isAdmin, adminLogout: authLogout, changeAdminPassword, loading: authLoading, adminData } = useAdminAuth();
  
  // Derived state
  const isProcessingAuth = authLoading;
  const currentUser = adminData;
  
  return {
    // State
    bots,
    setBots,
    adminActions,
    setAdminActions,
    loading,
    setLoading,
    onlineUsers, 
    setOnlineUsers,
    
    // Auth state
    isAdmin,
    currentUser,
    isProcessingAuth,
    
    // Auth actions
    authLogout,
    changeAdminPassword
  };
};
