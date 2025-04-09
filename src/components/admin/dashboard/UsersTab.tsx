
import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import UserTable from '@/components/admin/UserTable';
import { Bot } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UsersTabProps {
  bots: Bot[];
  onlineUsers: string[];
  onViewAll: () => void;
}

// Use React.memo to prevent unnecessary re-renders
const UsersTab: React.FC<UsersTabProps> = React.memo(({ bots, onlineUsers, onViewAll }) => {
  const [userTab, setUserTab] = useState<'all' | 'vip' | 'standard'>('all');
  const { kickUser, banUser, upgradeToVIP, downgradeToStandard } = useAdmin();
  
  // Filter users by VIP status
  const vipUsers = bots.filter(bot => bot.vip);
  const standardUsers = bots.filter(bot => !bot.vip);
  
  // Filter by online status
  const onlineVipUsers = vipUsers.filter(user => onlineUsers.includes(user.id));
  const onlineStandardUsers = standardUsers.filter(user => onlineUsers.includes(user.id));
  
  return (
    <Card className={cn("admin-effect")}>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, permissions, and VIP status. Currently {onlineUsers.length} users online.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={userTab} onValueChange={(value) => setUserTab(value as 'all' | 'vip' | 'standard')} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">
              All Users <Badge variant="outline" className="ml-2">{bots.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="vip">
              VIP Users <Badge variant="outline" className="ml-2">{vipUsers.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="standard">
              Standard Users <Badge variant="outline" className="ml-2">{standardUsers.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <UserTable 
              users={bots} 
              onlineUsers={onlineUsers} 
              onViewAll={onViewAll}
              showAll={true}
              userType="all"
            />
          </TabsContent>
          
          <TabsContent value="vip">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3">Online VIP Users</h3>
              {onlineVipUsers.length > 0 ? (
                <UserTable 
                  users={onlineVipUsers}
                  onlineUsers={onlineUsers}
                  showAll={true}
                  userType="vip"
                />
              ) : (
                <p className="text-muted-foreground">No VIP users currently online</p>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">All VIP Users</h3>
              <UserTable 
                users={vipUsers}
                onlineUsers={onlineUsers}
                showAll={true}
                userType="vip"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="standard">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3">Online Standard Users</h3>
              {onlineStandardUsers.length > 0 ? (
                <UserTable 
                  users={onlineStandardUsers}
                  onlineUsers={onlineUsers}
                  showAll={true}
                  userType="standard"
                />
              ) : (
                <p className="text-muted-foreground">No standard users currently online</p>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">All Standard Users</h3>
              <UserTable 
                users={standardUsers}
                onlineUsers={onlineUsers}
                showAll={true}
                userType="standard"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

// Set display name for React DevTools
UsersTab.displayName = 'UsersTab';

export default UsersTab;
