
import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback, useRef, useEffect } from 'react';

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
  const isTransitioningRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  // Memoize functions to prevent unnecessary re-renders
  const openDialog = useCallback((type: DialogType, data?: Record<string, any>) => {
    // Don't open a new dialog if we're already transitioning
    if (isTransitioningRef.current) return;
    
    // Set transitioning state
    isTransitioningRef.current = true;
    
    // Make sure body is prepared for the dialog
    if (document.body) {
      document.body.classList.add('dialog-open');
    }
    
    // Open the dialog
    dispatch({ type: 'OPEN_DIALOG', payload: { type, data } });
    
    // Reset transitioning state after a short delay
    const timeoutId = setTimeout(() => {
      isTransitioningRef.current = false;
    }, 100);
    
    timeoutsRef.current.push(timeoutId);
  }, []);
  
  const closeDialog = useCallback(() => {
    // Don't close if we're already transitioning
    if (isTransitioningRef.current) return;
    
    // Set transitioning state
    isTransitioningRef.current = true;
    
    // Reset body state
    if (document.body) {
      document.body.classList.remove('dialog-open');
    }
    
    // Close the dialog
    dispatch({ type: 'CLOSE_DIALOG' });
    
    // Reset transitioning state after the animation completes
    const timeoutId = setTimeout(() => {
      isTransitioningRef.current = false;
    }, 300); // Match animation duration
    
    timeoutsRef.current.push(timeoutId);
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
