
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bot } from '@/types/chat';
import { Circle, CheckCircle2 } from 'lucide-react';
import UserActionsButton from './UserActionsButton';
import { Button } from '@/components/ui/button';

interface UserTableProps {
  users: Bot[];
  onlineUsers: string[];
  showAll?: boolean;
  onViewAll?: () => void;
  userType?: 'all' | 'vip' | 'standard';
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onlineUsers, 
  showAll = false,
  onViewAll,
  userType = 'all'
}) => {
  // Helper function to check if a bot is online
  const isBotOnline = (botId: string) => {
    return onlineUsers && onlineUsers.includes(botId);
  };

  // Display only first 5 users if not showing all
  const displayUsers = showAll ? users : users.slice(0, 5);
  const hasMore = !showAll && users.length > 5;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>VIP</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayUsers.length > 0 ? (
            displayUsers.map((user: Bot) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium flex items-center">
                  <span className="mr-2">{user.avatar}</span>
                  {user.name}
                </TableCell>
                <TableCell>
                  {isBotOnline(user.id) ? (
                    <span className="flex items-center">
                      <Circle className="h-3 w-3 fill-green-500 text-green-500 mr-1" />
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Circle className="h-3 w-3 fill-gray-300 text-gray-300 mr-1" />
                      Offline
                    </span>
                  )}
                </TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>
                  {user.vip ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <UserActionsButton 
                      user={user}
                      userType={userType} 
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                <p className="text-muted-foreground">No users to display</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {hasMore && onViewAll && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={onViewAll}>
            View All Users
          </Button>
        </div>
      )}
    </>
  );
};

export default UserTable;
