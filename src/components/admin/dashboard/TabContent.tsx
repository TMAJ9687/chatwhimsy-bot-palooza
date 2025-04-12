
import React, { Suspense, lazy } from 'react';

// Lazy load tab components
const OverviewTab = lazy(() => import('@/components/admin/dashboard/OverviewTab'));
const UsersTab = lazy(() => import('@/components/admin/dashboard/UsersTab'));
const ModerationTab = lazy(() => import('@/components/admin/dashboard/ModerationTab'));
const BotsTab = lazy(() => import('@/components/admin/dashboard/BotsTab'));
const ReportsTab = lazy(() => import('@/components/admin/dashboard/ReportsTab'));
const SiteSettingsTab = lazy(() => import('@/components/admin/dashboard/SiteSettingsTab'));
const AdminSettingsTab = lazy(() => import('@/components/admin/dashboard/AdminSettingsTab'));
const Statistics = lazy(() => import('@/components/admin/statistics/Statistics'));

// TabLoader component
const TabLoader = () => (
  <div className="flex items-center justify-center w-full h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

interface TabContentProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  dataLoading: boolean;
  stats: {
    totalUsers: number;
    vipUsers: number;
    activeBans: number;
  };
  bots: any[];
  onlineUsers: string[] | undefined;
}

const TabContent: React.FC<TabContentProps> = ({ 
  currentTab, 
  setCurrentTab, 
  dataLoading, 
  stats, 
  bots, 
  onlineUsers 
}) => {
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
};

export default TabContent;
