
import { DialogType } from '@/context/DialogContext';
import { useCallback } from 'react';
import { useDialog } from '@/context/DialogContext';
import { useLogout } from '@/hooks/useLogout';

/**
 * Utility hook for opening the logout confirmation dialog
 */
export const useLogoutDialog = () => {
  const { openDialog } = useDialog();
  const { performLogout } = useLogout();
  
  const showLogoutConfirmation = useCallback(() => {
    openDialog('logout', { 
      onConfirm: () => {
        performLogout();
      }
    });
  }, [openDialog, performLogout]);
  
  return { showLogoutConfirmation };
};
