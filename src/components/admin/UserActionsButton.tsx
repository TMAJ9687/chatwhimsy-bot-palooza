
import React, { useState } from 'react';
import { Bot } from '@/types/chat';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { useDialog } from '@/hooks/use-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Crown, Shield, UserMinus, Ban, Edit, User } from 'lucide-react';

interface UserActionsButtonProps {
  user: Bot;
  userType?: 'all' | 'vip' | 'standard';
}

const UserActionsButton: React.FC<UserActionsButtonProps> = ({ user, userType = 'all' }) => {
  const { kickUser, banUser, upgradeToVIP, downgradeToStandard, isProcessing } = useAdmin();
  const { toast } = useToast();
  const { openDialog } = useDialog();
  const [isOpen, setIsOpen] = useState(false);

  const handleKickUser = () => {
    openDialog('confirm', {
      title: 'Kick User',
      message: `Are you sure you want to kick ${user.name}?`,
      confirmLabel: 'Kick',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        const success = await kickUser(user.id);
        if (success) {
          toast({
            title: 'User Kicked',
            description: `${user.name} has been kicked`
          });
        }
      }
    });
    setIsOpen(false);
  };

  const handleBanUser = () => {
    openDialog('prompt', {
      title: 'Ban User',
      message: `Why do you want to ban ${user.name}?`,
      placeholder: 'Enter reason',
      confirmLabel: 'Ban',
      cancelLabel: 'Cancel',
      onConfirm: async (reason: string) => {
        if (!reason) {
          toast({
            title: 'Error',
            description: 'Please provide a reason for banning',
            variant: 'destructive'
          });
          return;
        }
        
        openDialog('select', {
          title: 'Ban Duration',
          message: 'Select ban duration:',
          options: [
            { label: '1 Day', value: '1 Day' },
            { label: '1 Week', value: '1 Week' },
            { label: '1 Month', value: '1 Month' },
            { label: 'Permanent', value: 'Permanent' }
          ],
          confirmLabel: 'Proceed',
          cancelLabel: 'Cancel',
          onConfirm: async (duration: string) => {
            const banRecord = await banUser(user.id, 'user', reason, duration);
            if (banRecord) {
              toast({
                title: 'User Banned',
                description: `${user.name} has been banned`
              });
            }
          }
        });
      }
    });
    setIsOpen(false);
  };

  const handleUpgradeToVip = () => {
    upgradeToVIP(user.id, user.name);
    setIsOpen(false);
  };

  const handleDowngradeFromVip = () => {
    downgradeToStandard(user.id, user.name);
    setIsOpen(false);
  };

  const handleEditUser = () => {
    openDialog('custom', {
      title: 'Edit User',
      content: 'UserEditForm',
      data: { user },
      onClose: () => setIsOpen(false)
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isProcessing}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 shadow-lg">
        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleEditUser}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleKickUser}>
          <UserMinus className="mr-2 h-4 w-4" />
          Kick
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleBanUser}>
          <Ban className="mr-2 h-4 w-4" />
          Ban
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {(!user.vip && (userType === 'all' || userType === 'standard')) && (
          <DropdownMenuItem onClick={handleUpgradeToVip}>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to VIP
          </DropdownMenuItem>
        )}
        
        {(user.vip && (userType === 'all' || userType === 'vip')) && (
          <DropdownMenuItem onClick={handleDowngradeFromVip}>
            <User className="mr-2 h-4 w-4" />
            Downgrade to Standard
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsButton;
