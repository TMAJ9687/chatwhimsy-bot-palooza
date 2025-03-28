
import { useCallback } from 'react';
import { useDialog } from '@/context/DialogContext';

/**
 * Utility hook for opening the logout confirmation dialog
 */
export const useLogoutDialog = () => {
  const { openDialog } = useDialog();
  
  const showLogoutConfirmation = useCallback(() => {
    openDialog('logout');
  }, [openDialog]);
  
  return { showLogoutConfirmation };
};
