
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/admin/useAdminAuth';
import { Bot } from '@/types/chat';
import { AdminAction, BanRecord, ReportFeedback } from '@/types/admin';

// Context type definition
interface AdminContextType {
  // Authentication state
  isAdmin: boolean;
  currentUser: any | null;
  isProcessingAuth: boolean;
  
  // Core state
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  bots: Bot[];
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>;
  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
  adminActions: AdminAction[];
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>;
  bannedUsers: BanRecord[];
  setBannedUsers: React.Dispatch<React.SetStateAction<BanRecord[]>>;
  reportsFeedback: ReportFeedback[];
  setReportsFeedback: React.Dispatch<React.SetStateAction<ReportFeedback[]>>;
  
  // Processing state
  isProcessing: boolean;
  
  // Authentication actions
  adminLogout: () => Promise<boolean>;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export const AdminProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Core admin state
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState<Bot[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [reportsFeedback, setReportsFeedback] = useState<ReportFeedback[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Authentication state and functions from useAdminAuth
  const { 
    isAdmin, 
    adminData: currentUser, 
    loading: authLoading,
    adminLogout,
    changeAdminPassword
  } = useAdminAuth();
  
  // Derived state
  const isProcessingAuth = authLoading;
  
  // Update processing state when any component is processing
  useEffect(() => {
    // This would be connected to individual processing states from other hooks
    // We'll implement this later when refactoring the individual hooks
  }, []);
  
  const contextValue: AdminContextType = {
    // Authentication state
    isAdmin,
    currentUser,
    isProcessingAuth,
    
    // Core state
    loading,
    setLoading,
    bots,
    setBots,
    onlineUsers,
    setOnlineUsers,
    adminActions,
    setAdminActions,
    bannedUsers,
    setBannedUsers,
    reportsFeedback,
    setReportsFeedback,
    
    // Processing state
    isProcessing,
    
    // Authentication actions
    adminLogout,
    changeAdminPassword,
  };
  
  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook for using the admin context
export const useAdminContext = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};
