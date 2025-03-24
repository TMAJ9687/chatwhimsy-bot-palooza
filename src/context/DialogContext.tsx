
import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';

// Define dialog types
type DialogType = 'report' | 'block' | 'siteRules' | 'logout' | 'vipLogin' | 'vipSignup' | 'vipSubscription' | 'vipPayment' | 'vipConfirmation' | null;

// Define dialog state
interface DialogState {
  isOpen: boolean;
  type: DialogType;
  data: Record<string, any>;
}

// Define dialog actions
type DialogAction = 
  | { type: 'OPEN_DIALOG'; payload: { type: DialogType; data?: Record<string, any> } }
  | { type: 'CLOSE_DIALOG' };

// Initial dialog state
const initialState: DialogState = {
  isOpen: false,
  type: null,
  data: {}
};

// Create context
const DialogContext = createContext<{
  state: DialogState;
  openDialog: (type: DialogType, data?: Record<string, any>) => void;
  closeDialog: () => void;
} | undefined>(undefined);

// Reducer function - optimized to avoid unnecessary renders
function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case 'OPEN_DIALOG':
      // Only update if dialog is not already open with the same type
      if (state.isOpen && state.type === action.payload.type) {
        return state;
      }
      return {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || {}
      };
    case 'CLOSE_DIALOG':
      // Only update if dialog is actually open
      if (!state.isOpen) {
        return state;
      }
      return {
        ...state,
        isOpen: false,
        // Keep type and data in state but mark as closed
        // This helps prevent re-renders when toggling the same dialog
      };
    default:
      return state;
  }
}

// Provider component
export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dialogReducer, initialState);

  // Memoize functions to prevent unnecessary re-renders
  const openDialog = useCallback((type: DialogType, data?: Record<string, any>) => {
    dispatch({ type: 'OPEN_DIALOG', payload: { type, data } });
  }, []);
  
  const closeDialog = useCallback(() => {
    dispatch({ type: 'CLOSE_DIALOG' });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    openDialog,
    closeDialog
  }), [state, openDialog, closeDialog]);

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

// Custom hook
export function useDialog() {
  const context = useContext(DialogContext);
  
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  
  return context;
}
