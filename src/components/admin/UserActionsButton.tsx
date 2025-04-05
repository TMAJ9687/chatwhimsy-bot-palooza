import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  UserCog, 
  ShieldCheck, 
  ShieldX, 
  Ban,
  Lock
} from 'lucide-react';
import { Bot } from '@/types/chat';
import { useVipConfirmation } from '@/hooks/admin/useVipConfirmation';
import { VipDuration } from '@/types/admin';

interface UserActionsButtonProps {
  user: Bot;
  onDeleteUser?: (userId: string) => Promise<boolean>;
  onSuspendUser?: (userId: string) => Promise<boolean>;
  onBanUser?: (userId: string) => Promise<boolean>;
  onUnbanUser?: (userId: string) => Promise<boolean>;
  onResetPassword?: (userId: string) => Promise<boolean>;
  onUpgradeToVIP?: (userId: string, duration: VipDuration) => Promise<boolean>;
  onDowngradeToStandard?: (userId: string) => Promise<boolean>;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Button with dropdown menu for user management actions in the admin dashboard
 */
const UserActionsButton: React.FC<UserActionsButtonProps> = ({
  user,
  onDeleteUser,
  onSuspendUser,
  onBanUser,
  onUnbanUser,
  onResetPassword,
  onUpgradeToVIP,
  onDowngradeToStandard,
  disabled = false,
  variant = 'outline'
}) => {
  // Use the VIP confirmation hook to show confirmation dialogs
  const { 
    showVipConfirmation, 
    showVipDowngradeConfirmation,
    showVipDurationSelect
  } = useVipConfirmation();

  // Handler for VIP upgrade - opens duration selection dialog first
  const handleUpgradeToVIP = () => {
    if (onUpgradeToVIP) {
      showVipDurationSelect(user.id, user.username, (userId, duration) => {
        // After duration is selected, show confirmation dialog
        showVipConfirmation(userId, user.username, duration, onUpgradeToVIP);
      });
    }
  };
  
  // Handler for VIP downgrade - shows confirmation directly
  const handleDowngradeFromVIP = () => {
    if (onDowngradeToStandard) {
      showVipDowngradeConfirmation(user.id, user.username, onDowngradeToStandard);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className="h-8 w-8 p-0"
          disabled={disabled}
        >
          <UserCog className="h-4 w-4" />
          <span className="sr-only">User Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Account Status Actions */}
        <DropdownMenuSeparator />
        {user.banned ? (
          <DropdownMenuItem 
            onClick={() => onUnbanUser && onUnbanUser(user.id)}
            disabled={!onUnbanUser || disabled}
          >
            <Ban className="mr-2 h-4 w-4 text-green-500" />
            <span>Unban User</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={() => onBanUser && onBanUser(user.id)}
            disabled={!onBanUser || disabled}
          >
            <Ban className="mr-2 h-4 w-4 text-red-500" />
            <span>Ban User</span>
          </DropdownMenuItem>
        )}
        
        {/* VIP Status Actions */}
        <DropdownMenuSeparator />
        {user.vip ? (
          <DropdownMenuItem 
            onClick={handleDowngradeFromVIP}
            disabled={!onDowngradeToStandard || disabled}
          >
            <ShieldX className="mr-2 h-4 w-4 text-red-500" />
            <span>Remove VIP Status</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem 
            onClick={handleUpgradeToVIP}
            disabled={!onUpgradeToVIP || disabled}
          >
            <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
            <span>Upgrade to VIP</span>
          </DropdownMenuItem>
        )}
        
        {/* Other User actions */}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onResetPassword && onResetPassword(user.id)}
          disabled={!onResetPassword || disabled}
        >
          <Lock className="mr-2 h-4 w-4" />
          <span>Reset Password</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsButton;
