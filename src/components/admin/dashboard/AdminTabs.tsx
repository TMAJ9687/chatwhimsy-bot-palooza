
import React from 'react';
import { 
  Activity, Users, Settings, UserPlus, ShieldAlert, MessageSquare, 
  BarChart4, Cog 
} from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminTabsProps {
  currentTab: string;
  onTabChange: (value: string) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ currentTab, onTabChange }) => {
  return (
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
  );
};

export default AdminTabs;
