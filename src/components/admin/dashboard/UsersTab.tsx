
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserTable from '@/components/admin/UserTable';
import { Bot } from '@/types/chat';
import { cn } from '@/lib/utils';

interface UsersTabProps {
  bots: Bot[];
  onlineUsers: string[];
  onViewAll: () => void;
}

// Use React.memo to prevent unnecessary re-renders
const UsersTab: React.FC<UsersTabProps> = React.memo(({ bots, onlineUsers, onViewAll }) => {
  return (
    <Card className={cn("admin-effect")}>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Manage user accounts, permissions, and status.</p>
        <UserTable 
          users={bots} 
          onlineUsers={onlineUsers || []} 
          onViewAll={onViewAll} 
        />
      </CardContent>
    </Card>
  );
});

// Set display name for React DevTools
UsersTab.displayName = 'UsersTab';

export default UsersTab;
