
import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback, useEffect, useRef } from 'react';

// Define dialog types
export type DialogType = 'report' | 'block' | 'siteRules' | 'logout' | 'vipLogin' | 'vipSignup' 
  | 'vipSubscription' | 'vipPayment' | 'vipConfirmation' | 'accountDeletion' | 'vipSelect' 
  | 'confirm' | 'alert' | 'prompt' | 'select' | null;

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

// Optimized reducer - completely reset state on close
function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || {}
      };
    case 'CLOSE_DIALOG':
      return initialState; // Reset completely to initial state 
    default:
      return state;
  }
}

// Provider component
export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dialogReducer, initialState);
  const dialogIdRef = useRef('dialog-context');
  const prevStateRef = useRef(state);

  // Effect to manage body scroll lock based on dialog state
  useEffect(() => {
    // Skip if state hasn't changed to avoid loops
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    // Apply body styles directly here instead of using UIStateContext
    if (state.isOpen) {
      // Lock body scroll when dialog opens
      document.body.style.overflow = 'hidden';
      document.body.classList.add('dialog-open');
    } else {
      // Unlock body scroll when dialog closes, but be careful about other active dialogs
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open');
    }
  }, [state]);

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
