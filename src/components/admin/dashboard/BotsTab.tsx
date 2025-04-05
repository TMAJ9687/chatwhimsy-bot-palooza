
import React from 'react';
import { Circle, CheckCircle2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bot } from '@/types/chat';
import UserActionsButton from '@/components/admin/UserActionsButton';

interface BotsTabProps {
  bots: Bot[];
  onlineUsers: string[];
}

const BotsTab: React.FC<BotsTabProps> = ({ bots, onlineUsers }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Manage AI chat bots, customize their profiles and responses.</p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>VIP</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bots.map((bot: Bot) => (
              <TableRow key={bot.id}>
                <TableCell>{bot.avatar}</TableCell>
                <TableCell className="font-medium">{bot.name}</TableCell>
                <TableCell>
                  {onlineUsers && onlineUsers.includes(bot.id) ? (
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
                <TableCell>{bot.age}</TableCell>
                <TableCell>{bot.gender}</TableCell>
                <TableCell>{bot.country}</TableCell>
                <TableCell>
                  {bot.vip ? (
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
                    <Button variant="outline" size="sm">Edit</Button>
                    <UserActionsButton user={bot} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-end mt-4">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Bot
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotsTab;
