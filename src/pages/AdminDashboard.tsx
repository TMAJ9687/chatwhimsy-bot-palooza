
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { adminDb } from '@/integrations/supabase/adminTypes';
import AdminErrorHandler from '@/components/admin/ErrorHandler';

// Import components
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import TabContent from '@/components/admin/dashboard/TabContent';
import AdminTabs from '@/components/admin/dashboard/AdminTabs';
import AdminChatOverlay from '@/components/admin/chat/AdminChatOverlay';
import AdminAuthChecker from '@/components/admin/dashboard/AdminAuthChecker';

const AdminDashboard = () => {
  const { adminLogout, isAdmin, loading, bots, onlineUsers } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('overview');
  const [retryCount, setRetryCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    vipUsers: 0,
    activeBans: 0
  });
  const [loadTimestamp, setLoadTimestamp] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);
  
  const redirectToLogin = useCallback(() => {
    navigate('/secretadminportal');
  }, [navigate]);
  
  // Throttled stats loading - once per 2 minutes maximum
  const loadStats = useCallback(async () => {
    // Prevent multiple loads within 2 minutes
    const now = Date.now();
    if (now - loadTimestamp < 120000) {
      return;
    }
    
    try {
      setDataLoading(true);
      setLoadTimestamp(now);
      
      const { data, error } = await adminDb.dashboard().getStats();
      
      if (!error && data) {
        setStats({
          totalUsers: data.total_users || bots.length || 0,
          vipUsers: data.vip_users || bots.filter(bot => bot.vip).length || 0,
          activeBans: data.active_bans || 0
        });
      }
    } catch (error) {
      // Silent failure
    } finally {
      setDataLoading(false);
    }
  }, [bots, loadTimestamp]);
  
  // Only load stats on initial mount
  useEffect(() => {
    if (isAdmin && !loading) {
      loadStats();
    }
  }, [isAdmin, loading, loadStats]); 
  
  const handleLogout = async () => {
    try {
      await adminLogout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      redirectToLogin();
    } catch (error) {
      // Ignore errors
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadStats();
    toast({
      title: "Refreshing",
      description: "Refreshing admin dashboard data...",
    });
  };
  
  const toggleChat = () => {
    setIsChatVisible(prev => !prev);
  };

  // Memoize header to prevent re-renders
  const memoizedHeader = useMemo(() => (
    <DashboardHeader 
      email={isAdmin ? localStorage.getItem('adminEmail') : undefined} 
      handleRetry={handleRetry}
      toggleChat={toggleChat}
    />
  ), [handleRetry, toggleChat, isAdmin]);
  
  return (
    <AdminErrorHandler>
      <AdminAuthChecker
        isAdmin={isAdmin}
        loading={loading}
        retryCount={retryCount}
        handleRetry={handleRetry}
        redirectToLogin={redirectToLogin}
      >
        <div className="container mx-auto p-6 relative">
          {memoizedHeader}
          
          {/* Chat Manager Overlay */}
          <AdminChatOverlay 
            isVisible={isChatVisible}
            toggleVisibility={toggleChat}
          />
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <AdminTabs 
              currentTab={currentTab}
              onTabChange={setCurrentTab}
            />
            
            <TabsContent value={currentTab} className="space-y-4">
              <TabContent
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                dataLoading={dataLoading}
                stats={stats}
                bots={bots}
                onlineUsers={onlineUsers}
              />
            </TabsContent>
          </Tabs>
        </div>
      </AdminAuthChecker>
    </AdminErrorHandler>
  );
};

export default AdminDashboard;
