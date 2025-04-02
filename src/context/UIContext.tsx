
import React, { createContext, useContext, useReducer, useCallback } from 'react';

type DialogType = 'report' | 'block' | 'siteRules' | 'logout' | 'vipLogin' | 'vipSignup' 
  | 'vipSubscription' | 'vipPayment' | 'vipConfirmation' | 'accountDeletion' | 'vipSelect' 
  | 'confirm' | 'alert' | null;

interface UIState {
  dialogs: {
    activeDialog: DialogType;
    dialogData: Record<string, any>;
  };
  modals: {
    isBodyLocked: boolean;
    activeModals: string[];
  };
}

type UIAction = 
  | { type: 'OPEN_DIALOG'; dialogType: DialogType; data?: Record<string, any> }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'LOCK_BODY' }
  | { type: 'UNLOCK_BODY' }
  | { type: 'REGISTER_MODAL'; id: string }
  | { type: 'UNREGISTER_MODAL'; id: string };

interface UIContextType {
  state: UIState;
  openDialog: (dialogType: DialogType, data?: Record<string, any>) => void;
  closeDialog: () => void;
  lockBody: () => void;
  unlockBody: () => void;
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;
}

const initialState: UIState = {
  dialogs: {
    activeDialog: null,
    dialogData: {},
  },
  modals: {
    isBodyLocked: false,
    activeModals: [],
  }
};

const UIContext = createContext<UIContextType | undefined>(undefined);

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        ...state,
        dialogs: {
          activeDialog: action.dialogType,
          dialogData: action.data || {},
        }
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        dialogs: {
          activeDialog: null,
          dialogData: {},
        }
      };
    case 'LOCK_BODY':
      return {
        ...state,
        modals: {
          ...state.modals,
          isBodyLocked: true
        }
      };
    case 'UNLOCK_BODY':
      return {
        ...state,
        modals: {
          ...state.modals,
          isBodyLocked: false
        }
      };
    case 'REGISTER_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          activeModals: [...state.modals.activeModals, action.id]
        }
      };
    case 'UNREGISTER_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          activeModals: state.modals.activeModals.filter(id => id !== action.id)
        }
      };
    default:
      return state;
  }
}

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const openDialog = useCallback((dialogType: DialogType, data?: Record<string, any>) => {
    dispatch({ type: 'OPEN_DIALOG', dialogType, data });
  }, []);

  const closeDialog = useCallback(() => {
    dispatch({ type: 'CLOSE_DIALOG' });
  }, []);

  const lockBody = useCallback(() => {
    // Use React to update state, and let useEffect handle the actual DOM update
    dispatch({ type: 'LOCK_BODY' });
  }, []);

  const unlockBody = useCallback(() => {
    dispatch({ type: 'UNLOCK_BODY' });
  }, []);

  const registerModal = useCallback((id: string) => {
    dispatch({ type: 'REGISTER_MODAL', id });
  }, []);

  const unregisterModal = useCallback((id: string) => {
    dispatch({ type: 'UNREGISTER_MODAL', id });
  }, []);

  // Effect to handle body scrolling based on state
  React.useEffect(() => {
    if (state.modals.isBodyLocked || state.modals.activeModals.length > 0) {
      // Use a declarative approach to manage body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [state.modals.isBodyLocked, state.modals.activeModals]);

  return (
    <UIContext.Provider 
      value={{ 
        state, 
        openDialog, 
        closeDialog, 
        lockBody, 
        unlockBody, 
        registerModal, 
        unregisterModal 
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
