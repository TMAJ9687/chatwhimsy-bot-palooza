
/**
 * DEPRECATED: This context has been replaced with the UIContext.
 * Please migrate to using useDialog hook from @/hooks/useDialog.
 * This file is kept for backward compatibility during transition.
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useUI } from './UIContext';

// Define dialog types
type DialogType = 'report' | 'block' | 'siteRules' | 'logout' | 'vipLogin' | 'vipSignup' 
  | 'vipSubscription' | 'vipPayment' | 'vipConfirmation' | 'accountDeletion' | 'vipSelect' 
  | 'confirm' | 'alert' | null;

// Define dialog state
interface DialogState {
  isOpen: boolean;
  type: DialogType;
  data: Record<string, any>;
}

// Create context for backward compatibility
const DialogContext = createContext<{
  state: DialogState;
  openDialog: (type: DialogType, data?: Record<string, any>) => void;
  closeDialog: () => void;
} | undefined>(undefined);

// Provider component that now uses UIContext
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const { 
    state: uiState, 
    openDialog: openUIDialog, 
    closeDialog: closeUIDialog 
  } = useUI();
  
  useEffect(() => {
    console.warn(
      'DialogContext is deprecated. Please migrate to using useDialog hook from @/hooks/useDialog.'
    );
  }, []);
  
  const state: DialogState = {
    isOpen: uiState.dialogs.activeDialog !== null,
    type: uiState.dialogs.activeDialog,
    data: uiState.dialogs.dialogData
  };

  const openDialog = (type: DialogType, data?: Record<string, any>) => {
    openUIDialog(type, data);
  };
  
  const closeDialog = () => {
    closeUIDialog();
  };

  return (
    <DialogContext.Provider value={{ state, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
}

// Custom hook for backward compatibility
export function useDialog() {
  const context = useContext(DialogContext);
  
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider or UIProvider');
  }
  
  return context;
}
