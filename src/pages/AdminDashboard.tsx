
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminSession from '@/hooks/useAdminSession';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Activity, Users, Settings, UserPlus, ShieldAlert, MessageSquare, BarChart4,
  Cog, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminDb } from '@/integrations/supabase/adminTypes';
import AdminErrorHandler from '@/components/admin/ErrorHandler';

// Import header and loader components
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardLoader from '@/components/admin/dashboard/DashboardLoader';

// Lazy load tab components
const OverviewTab = lazy(() => import('@/components/admin/dashboard/OverviewTab'));
const UsersTab = lazy(() => import('@/components/admin/dashboard/UsersTab'));
const ModerationTab = lazy(() => import('@/components/admin/dashboard/ModerationTab'));
const BotsTab = lazy(() => import('@/components/admin/dashboard/BotsTab'));
const ReportsTab = lazy(() => import('@/components/admin/dashboard/ReportsTab'));
const SiteSettingsTab = lazy(() => import('@/components/admin/dashboard/SiteSettingsTab'));
const AdminSettingsTab = lazy(() => import('@/components/admin/dashboard/AdminSettingsTab'));
const Statistics = lazy(() => import('@/components/admin/statistics/Statistics'));

// Lazy load chat manager
const AdminChatManager = lazy(() => import('@/components/admin/chat/AdminChatManager'));

// TabLoader component
const TabLoader = () => (
  <div className="flex items-center justify-center w-full h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
  const [loadTimestamp, setLoadTimestamp] = useState(0);
  const [isChatVisible, setIsChatVisible] = useState(false);
  
  const redirectToLogin = useCallback(() => {
    navigate('/secretadminportal');
  }, [navigate]);
  
  // Check authentication and redirect if needed
  useEffect(() => {
    if (!isAuthenticated && !sessionLoading && !loading) {
      redirectToLogin();
    }
  }, [isAuthenticated, redirectToLogin, sessionLoading, loading]);
  
  // Extreme throttling for stats loading - once per 2 minutes maximum
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
  
  // Only load stats on initial mount - removed from dependencies
  useEffect(() => {
    if (isAuthenticated && !sessionLoading) {
      loadStats();
    }
  }, [isAuthenticated, sessionLoading]); // Removed loadStats dependency
  
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
    refreshSession();
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
      email={user?.email} 
      handleLogout={handleLogout} 
      handleRetry={handleRetry}
      toggleChat={toggleChat}
    />
  ), [user?.email, handleLogout, handleRetry]);
  
  // Memoize tab content to improve performance
  const tabContent = useMemo(() => {
    switch(currentTab) {
      case 'overview':
        return (
          <Suspense fallback={<TabLoader />}>
            <OverviewTab 
              dataLoading={dataLoading} 
              stats={stats} 
              onlineUsersCount={onlineUsers?.length || 0} 
              setCurrentTab={setCurrentTab} 
            />
          </Suspense>
        );
      case 'users':
        return (
          <Suspense fallback={<TabLoader />}>
            <UsersTab 
              bots={bots} 
              onlineUsers={onlineUsers || []} 
              onViewAll={() => setCurrentTab('bots')} 
            />
          </Suspense>
        );
      case 'moderation':
        return (
          <Suspense fallback={<TabLoader />}>
            <ModerationTab />
          </Suspense>
        );
      case 'bots':
        return (
          <Suspense fallback={<TabLoader />}>
            <BotsTab bots={bots} onlineUsers={onlineUsers || []} />
          </Suspense>
        );
      case 'reports':
        return (
          <Suspense fallback={<TabLoader />}>
            <ReportsTab />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<TabLoader />}>
            <SiteSettingsTab />
          </Suspense>
        );
      case 'admin-settings':
        return (
          <Suspense fallback={<TabLoader />}>
            <AdminSettingsTab />
          </Suspense>
        );
      case 'statistics':
        return (
          <Suspense fallback={<TabLoader />}>
            <Statistics />
          </Suspense>
        );
      default:
        return null;
    }
  }, [currentTab, bots, onlineUsers, dataLoading, stats, setCurrentTab]);

  // Show loader if not authenticated or still loading
  if (!isAuthenticated && !sessionLoading || sessionLoading || loading) {
    return (
      <AdminErrorHandler>
        <DashboardLoader
          isAuthenticated={isAuthenticated}
          sessionLoading={sessionLoading}
          loading={loading}
          retryCount={retryCount}
          handleRetry={handleRetry}
          redirectToLogin={redirectToLogin}
        />
      </AdminErrorHandler>
    );
  }
  
  return (
    <AdminErrorHandler>
      <div className="container mx-auto p-6 relative">
        {memoizedHeader}
        
        {/* Chat Manager - will be shown in full screen when isChatVisible is true */}
        <Suspense fallback={null}>
          <div className={`fixed inset-0 bg-white dark:bg-gray-900 z-50 transition-transform duration-300 transform ${isChatVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Admin Chat</h2>
                <Button variant="outline" onClick={toggleChat}>Close Chat</Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AdminChatManager />
              </div>
            </div>
          </div>
        </Suspense>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Site Settings</span>
            </TabsTrigger>
            <TabsTrigger value="admin-settings" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              <span>Admin</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab} className="space-y-4">
            {tabContent}
          </TabsContent>
        </Tabs>
      </div>
    </AdminErrorHandler>
  );
};

export default AdminDashboard;
