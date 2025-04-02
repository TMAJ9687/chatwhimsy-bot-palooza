
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Define modal types
type ModalType = 'report' | 'block' | 'siteRules' | 'logout' | 'vipLogin' | 'vipSignup' 
  | 'vipSubscription' | 'vipPayment' | 'vipConfirmation' | 'accountDeletion' | 'vipSelect' 
  | 'confirm' | 'alert' | null;

// Define modal state
interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: Record<string, any>;
}

// Define modal actions
type ModalAction = 
  | { type: 'OPEN_MODAL'; payload: { type: ModalType; data?: Record<string, any> } }
  | { type: 'CLOSE_MODAL' };

// Initial state
const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: {}
};

// Create context
const ModalContext = createContext<{
  state: ModalState;
  openModal: (type: ModalType, data?: Record<string, any>) => void;
  closeModal: () => void;
} | null>(null);

// Reducer
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || {}
      };
    case 'CLOSE_MODAL':
      return initialState;
    default:
      return state;
  }
}

// Provider component
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  
  const openModal = useCallback((type: ModalType, data?: Record<string, any>) => {
    dispatch({ type: 'OPEN_MODAL', payload: { type, data } });
  }, []);
  
  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);
  
  return (
    <ModalContext.Provider value={{ state, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
