
import React from 'react';
import { User, Ban, UserPlus, BarChart4 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OverviewTabProps {
  dataLoading: boolean;
  stats: {
    totalUsers: number;
    vipUsers: number;
    activeBans: number;
  };
  onlineUsersCount: number;
  setCurrentTab: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  dataLoading,
  stats,
  onlineUsersCount,
  setCurrentTab
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to the admin dashboard. Use the tabs above to navigate to different sections.</p>
        
        {dataLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">Loading stats...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">VIP Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vipUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Online Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onlineUsersCount || 0}</div>
                <p className="text-xs text-muted-foreground">Active now</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('users')}>
              <User className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('moderation')}>
              <Ban className="h-6 w-6 mb-2" />
              <span>User Bans</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('bots')}>
              <UserPlus className="h-6 w-6 mb-2" />
              <span>Manage Bots</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => setCurrentTab('statistics')}>
              <BarChart4 className="h-6 w-6 mb-2" />
              <span>Statistics</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewTab;
