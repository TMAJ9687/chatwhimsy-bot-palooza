
import { useCallback } from 'react';
import { useUI } from '@/context/UIContext';

// Dialog type from UIContext
type DialogType = 'report' | 'block' | 'siteRules' | 'logout' | 'vipLogin' | 'vipSignup' 
  | 'vipSubscription' | 'vipPayment' | 'vipConfirmation' | 'accountDeletion' | 'vipSelect' 
  | 'confirm' | 'alert' | null;

export const useDialog = () => {
  const { state, openDialog: openUIDialog, closeDialog: closeUIDialog } = useUI();
  
  const { activeDialog, dialogData } = state.dialogs;

  const openDialog = useCallback((type: DialogType, data?: Record<string, any>) => {
    openUIDialog(type, data);
  }, [openUIDialog]);

  const closeDialog = useCallback(() => {
    closeUIDialog();
  }, [closeUIDialog]);

  // For backwards compatibility with existing pattern
  const dialogState = {
    isOpen: activeDialog !== null,
    type: activeDialog,
    data: dialogData
  };

  return {
    openDialog,
    closeDialog,
    state: dialogState
  };
};
