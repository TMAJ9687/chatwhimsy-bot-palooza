
import { useCallback } from 'react';
import { useDialog } from '@/hooks/use-dialog';
import { VipDuration } from '@/types/admin';

/**
 * Hook for VIP confirmation dialogs
 */
export const useVipConfirmation = () => {
  const { openDialog } = useDialog();
  
  // Show VIP duration selection dialog
  const showVipDurationSelect = useCallback((
    userId: string, 
    username?: string,
    onSelect?: (userId: string, duration: VipDuration) => void
  ) => {
    openDialog('select', {
      title: 'Select VIP Duration',
      message: `Select VIP duration for ${username || 'user'}:`,
      options: [
        { label: '1 Day', value: '1 Day' },
        { label: '1 Week', value: '1 Week' },
        { label: '1 Month', value: '1 Month' },
        { label: '1 Year', value: '1 Year' },
        { label: 'Lifetime', value: 'Lifetime' },
      ],
      confirmLabel: 'Next',
      cancelLabel: 'Cancel',
      onConfirm: (duration: string) => {
        if (onSelect) {
          onSelect(userId, duration as VipDuration);
        }
      },
    });
  }, [openDialog]);
  
  // Show VIP upgrade confirmation dialog
  const showVipConfirmation = useCallback((
    userId: string,
    username?: string,
    duration?: VipDuration,
    onConfirm?: (userId: string, duration: VipDuration) => void
  ) => {
    openDialog('confirm', {
      title: 'Confirm VIP Upgrade',
      message: `Are you sure you want to upgrade ${username || 'this user'} to VIP${duration ? ` for ${duration}` : ''}?`,
      confirmLabel: 'Upgrade',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        if (onConfirm && duration) {
          onConfirm(userId, duration);
        }
      }
    });
  }, [openDialog]);
  
  // Show VIP downgrade confirmation dialog
  const showVipDowngradeConfirmation = useCallback((
    userId: string,
    username?: string,
    onConfirm?: (userId: string) => void
  ) => {
    openDialog('confirm', {
      title: 'Confirm VIP Downgrade',
      message: `Are you sure you want to downgrade ${username || 'this user'} from VIP to standard?`,
      confirmLabel: 'Downgrade',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        if (onConfirm) {
          onConfirm(userId);
        }
      }
    });
  }, [openDialog]);
  
  return {
    showVipDurationSelect,
    showVipConfirmation,
    showVipDowngradeConfirmation
  };
};
