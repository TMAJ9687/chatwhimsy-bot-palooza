
import React from 'react';
import { Circle, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Bot } from '@/types/chat';
import UserActionsButton from '@/components/admin/UserActionsButton';

interface BotListTableProps {
  bots: Bot[];
  onlineUsers: string[];
  onEdit: (bot: Bot) => void;
}

const BotListTable: React.FC<BotListTableProps> = ({ bots, onlineUsers, onEdit }) => {
  return (
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
                <Button variant="outline" size="sm" onClick={() => onEdit(bot)}>Edit</Button>
                <UserActionsButton user={bot} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BotListTable;
