
import { useCallback } from 'react';
import { useDialog } from '@/context/DialogContext';
import { VipDuration } from '@/types/admin';
import { calculateExpiryDate } from '@/utils/admin/vipUtils';

/**
 * Custom hook for handling VIP confirmation dialogs
 */
export const useVipConfirmation = () => {
  const { openDialog } = useDialog();
  
  // Show VIP confirmation dialog with expiry information
  const showVipConfirmation = useCallback((
    userId: string, 
    username: string | undefined,
    duration: VipDuration,
    onConfirm: (userId: string, duration: VipDuration) => Promise<boolean>
  ) => {
    const expiryDate = calculateExpiryDate(duration);
    const expiryText = expiryDate ? 
      `until ${expiryDate.toLocaleDateString()}` : 
      'permanently (no expiration)';
    
    openDialog('confirm', {
      title: 'Confirm VIP Upgrade',
      message: `Are you sure you want to upgrade ${username || userId} to VIP status ${expiryText}?`,
      confirmLabel: 'Upgrade to VIP',
      cancelLabel: 'Cancel',
      onConfirm: () => onConfirm(userId, duration)
    });
  }, [openDialog]);
  
  // Show VIP downgrade confirmation dialog
  const showVipDowngradeConfirmation = useCallback((
    userId: string,
    username: string | undefined,
    onConfirm: (userId: string) => Promise<boolean>
  ) => {
    openDialog('confirm', {
      title: 'Confirm VIP Downgrade',
      message: `Are you sure you want to downgrade ${username || userId} from VIP status?`,
      confirmLabel: 'Downgrade',
      cancelLabel: 'Cancel',
      onConfirm: () => onConfirm(userId)
    });
  }, [openDialog]);
  
  // Show VIP duration selection dialog
  const showVipDurationSelect = useCallback((
    userId: string,
    username: string | undefined,
    onSelectDuration: (userId: string, duration: VipDuration) => void
  ) => {
    openDialog('select', {
      title: 'Select VIP Duration',
      message: `Choose the VIP duration for ${username || userId}:`,
      options: [
        { label: '1 Day', value: '1 Day' },
        { label: '1 Week', value: '1 Week' },
        { label: '1 Month', value: '1 Month' },
        { label: '1 Year', value: '1 Year' },
        { label: 'Lifetime', value: 'Lifetime' }
      ],
      confirmLabel: 'Continue',
      cancelLabel: 'Cancel',
      onConfirm: (value: string) => {
        onSelectDuration(userId, value as VipDuration);
      }
    });
  }, [openDialog]);
  
  return {
    showVipConfirmation,
    showVipDowngradeConfirmation,
    showVipDurationSelect
  };
};
