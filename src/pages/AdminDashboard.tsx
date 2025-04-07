
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminSession from '@/hooks/useAdminSession';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Users, Settings, UserPlus, ShieldAlert, MessageSquare, BarChart4
} from 'lucide-react';
import Statistics from '@/components/admin/statistics/Statistics';
import { useToast } from '@/hooks/use-toast';
import { adminDb } from '@/integrations/supabase/adminTypes';
import AdminErrorHandler from '@/components/admin/ErrorHandler';

// Import refactored components
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardLoader from '@/components/admin/dashboard/DashboardLoader';
import OverviewTab from '@/components/admin/dashboard/OverviewTab';
import UsersTab from '@/components/admin/dashboard/UsersTab';
import ModerationTab from '@/components/admin/dashboard/ModerationTab';
import BotsTab from '@/components/admin/dashboard/BotsTab';
import ReportsTab from '@/components/admin/dashboard/ReportsTab';

// Import admin chat components
import AdminChatButton from '@/components/admin/chat/AdminChatButton';
import AdminChatSidebar from '@/components/admin/chat/AdminChatSidebar';
import { useAdminChat } from '@/hooks/admin/useAdminChat';

const AdminDashboard = () => {
  const { isAuthenticated, user, isLoading: sessionLoading, refreshSession } = useAdminSession();
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
  
  // Initialize admin chat state
  const { isChatOpen, openChat, closeChat } = useAdminChat();
  
  const redirectToLogin = useCallback(() => {
    navigate('/secretadminportal');
  }, [navigate]);
  
  useEffect(() => {
    if (!isAuthenticated && !sessionLoading && !loading) {
      console.log('Not authenticated, redirecting to login');
      redirectToLogin();
    }
  }, [isAuthenticated, redirectToLogin, sessionLoading, loading]);
  
  const loadStats = useCallback(async () => {
    try {
      setDataLoading(true);
      console.log('Loading dashboard stats...');
      
      const { data, error } = await adminDb.dashboard().getStats();
      
      if (error) {
        console.error('Error loading stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin dashboard stats',
          variant: 'destructive',
        });
        return;
      }
      
      if (data) {
        setStats({
          totalUsers: data.total_users || bots.length || 0,
          vipUsers: data.vip_users || bots.filter(bot => bot.vip).length || 0,
          activeBans: data.active_bans || 0
        });
        console.log('Dashboard stats loaded successfully');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading stats',
        variant: 'destructive',
      });
    } finally {
      setDataLoading(false);
    }
  }, [toast, bots]);
  
  useEffect(() => {
    if (isAuthenticated && !sessionLoading) {
      loadStats();
    }
  }, [isAuthenticated, sessionLoading, loadStats]);
  
  const handleLogout = async () => {
    try {
      await adminLogout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      redirectToLogin();
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refreshSession();
    loadStats();
    toast({
      title: "Refreshing",
      description: "Refreshing admin dashboard data...",
    });
  };

  // Show loader if not authenticated or still loading
  const loader = (
    <DashboardLoader
      isAuthenticated={isAuthenticated}
      sessionLoading={sessionLoading}
      loading={loading}
      retryCount={retryCount}
      handleRetry={handleRetry}
      redirectToLogin={redirectToLogin}
    />
  );
  
  if (!isAuthenticated && !sessionLoading || sessionLoading || loading) {
    return <AdminErrorHandler>{loader}</AdminErrorHandler>;
  }
  
  return (
    <AdminErrorHandler>
      <div className="container mx-auto p-6">
        <DashboardHeader 
          email={user?.email} 
          handleLogout={handleLogout} 
          handleRetry={handleRetry} 
        />
        
        {/* Add chat button in a fixed position */}
        <div className="fixed bottom-6 right-6 z-40">
          <AdminChatButton onClick={openChat} />
        </div>
        
        {/* Admin Chat Sidebar */}
        <AdminChatSidebar isOpen={isChatOpen} onClose={closeChat} />
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Moderation</span>
            </TabsTrigger>
            <TabsTrigger value="bots" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Bots</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <OverviewTab 
              dataLoading={dataLoading} 
              stats={stats} 
              onlineUsersCount={onlineUsers?.length || 0} 
              setCurrentTab={setCurrentTab} 
            />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <UsersTab 
              bots={bots} 
              onlineUsers={onlineUsers || []} 
              onViewAll={() => setCurrentTab('bots')} 
            />
          </TabsContent>
          
          <TabsContent value="moderation" className="space-y-4">
            <ModerationTab />
          </TabsContent>
          
          <TabsContent value="bots" className="space-y-4">
            <BotsTab bots={bots} onlineUsers={onlineUsers || []} />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <ReportsTab />
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <Statistics />
          </TabsContent>
        </Tabs>
      </div>
    </AdminErrorHandler>
  );
};

export default AdminDashboard;
