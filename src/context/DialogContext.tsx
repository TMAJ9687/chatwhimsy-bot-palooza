
import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';

// Define dialog types
type DialogType = 'report' | 'block' | 'siteRules' | null;

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

// Reducer function
function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || {}
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        isOpen: false
      };
    default:
      return state;
  }
}

// Provider component
export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dialogReducer, initialState);

  // Memoize functions to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    openDialog: (type: DialogType, data?: Record<string, any>) => 
      dispatch({ type: 'OPEN_DIALOG', payload: { type, data } }),
    closeDialog: () => dispatch({ type: 'CLOSE_DIALOG' })
  }), [state]);

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
