
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserTable from '@/components/admin/UserTable';
import { Bot } from '@/types/chat';

interface UsersTabProps {
  bots: Bot[];
  onlineUsers: string[];
  onViewAll: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ bots, onlineUsers, onViewAll }) => {
  return (
    <Card>
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
};

export default UsersTab;
