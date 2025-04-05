
import React, { useState } from 'react';
import { 
  MoreHorizontal, Ban, ShieldAlert, Crown, UserX, CheckCircle 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import { Bot } from '@/types/chat';
import { useDialog } from '@/hooks/use-dialog';

interface UserActionsButtonProps {
  user: Bot;
}

/**
 * Admin actions dropdown menu for users/bots
 */
const UserActionsButton = ({ user }: UserActionsButtonProps) => {
  const { 
    kickUser, 
    banUser, 
    upgradeToVIP, 
    downgradeToStandard,
    isProcessing 
  } = useAdmin();
  const { openDialog } = useDialog();
  
  // Handle kick user
  const handleKick = () => {
    openDialog('confirm', {
      title: 'Kick User',
      message: `Are you sure you want to kick ${user.name} from the platform?`,
      confirmLabel: 'Kick User',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        const success = await kickUser(user.id);
        if (success) {
          openDialog('alert', {
            title: 'User Kicked',
            message: `${user.name} has been kicked from the platform.`
          });
        }
      }
    });
  };

  // Handle ban user
  const handleBan = () => {
    openDialog('prompt', {
      title: 'Ban User',
      message: `Please provide a reason for banning ${user.name}:`,
      placeholder: 'Reason for ban',
      confirmLabel: 'Ban User',
      cancelLabel: 'Cancel',
      onConfirm: async (reason) => {
        if (reason) {
          const banRecord = await banUser(user.id, 'user', reason, '1 Week');
          if (banRecord) {
            openDialog('alert', {
              title: 'User Banned',
              message: `${user.name} has been banned from the platform.`
            });
          }
        }
      }
    });
  };

  // Handle VIP upgrade
  const handleUpgradeToVIP = () => {
    openDialog('select', {
      title: 'Upgrade to VIP',
      message: `Select VIP duration for ${user.name}:`,
      options: [
        { label: '1 Day', value: '1 Day' },
        { label: '1 Week', value: '1 Week' },
        { label: '1 Month', value: '1 Month' },
        { label: '1 Year', value: '1 Year' },
        { label: 'Lifetime', value: 'Lifetime' },
      ],
      defaultValue: '1 Month',
      confirmLabel: 'Upgrade',
      cancelLabel: 'Cancel',
      onConfirm: async (duration) => {
        if (duration) {
          const success = await upgradeToVIP(user.id, duration);
          if (success) {
            openDialog('alert', {
              title: 'User Upgraded',
              message: `${user.name} has been upgraded to VIP for ${duration}.`
            });
          }
        }
      }
    });
  };

  // Handle VIP downgrade
  const handleDowngradeVIP = () => {
    openDialog('confirm', {
      title: 'Remove VIP Status',
      message: `Are you sure you want to remove VIP status from ${user.name}?`,
      confirmLabel: 'Remove VIP',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        const success = await downgradeToStandard(user.id);
        if (success) {
          openDialog('alert', {
            title: 'VIP Removed',
            message: `${user.name}'s VIP status has been removed.`
          });
        }
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Kick User */}
        <DropdownMenuItem onClick={handleKick}>
          <UserX className="mr-2 h-4 w-4" />
          <span>Kick User</span>
        </DropdownMenuItem>
        
        {/* Ban User */}
        <DropdownMenuItem onClick={handleBan}>
          <Ban className="mr-2 h-4 w-4" />
          <span>Ban User</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* VIP Management */}
        {user.vip ? (
          <DropdownMenuItem onClick={handleDowngradeVIP}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Remove VIP Status</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleUpgradeToVIP}>
            <Crown className="mr-2 h-4 w-4" />
            <span>Upgrade to VIP</span>
          </DropdownMenuItem>
        )}
        
        {/* More options can be added here */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsButton;
