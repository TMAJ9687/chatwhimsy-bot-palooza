
import React, { createContext, useContext, useState, useCallback, useReducer, useEffect } from 'react';

// Define the types for our UI state
interface UIState {
  // Overlay management
  overlays: {
    isBodyLocked: boolean;
    activeOverlays: string[];
  };
  // Navigation state
  navigation: {
    isNavigating: boolean;
    lastPathname: string | null;
    navigationStartTime: number | null;
  };
  // Error states
  errors: {
    hasDOMError: boolean;
    lastErrorMessage: string | null;
    errorTimestamp: number | null;
  };
}

// Define the actions for our reducer
type UIAction = 
  | { type: 'LOCK_BODY' }
  | { type: 'UNLOCK_BODY' }
  | { type: 'ADD_OVERLAY', id: string }
  | { type: 'REMOVE_OVERLAY', id: string }
  | { type: 'CLEAR_OVERLAYS' }
  | { type: 'START_NAVIGATION', pathname: string }
  | { type: 'END_NAVIGATION' }
  | { type: 'RECORD_ERROR', message: string }
  | { type: 'CLEAR_ERROR' };

// Create the context
interface UIStateContextType {
  state: UIState;
  lockBody: () => void;
  unlockBody: () => void;
  addOverlay: (id: string) => void;
  removeOverlay: (id: string) => void;
  clearOverlays: () => void;
  startNavigation: (pathname: string) => void;
  endNavigation: () => void;
  recordError: (message: string) => void;
  clearError: () => void;
  isOverlayActive: (id: string) => boolean;
}

const initialState: UIState = {
  overlays: {
    isBodyLocked: false,
    activeOverlays: [],
  },
  navigation: {
    isNavigating: false,
    lastPathname: null,
    navigationStartTime: null,
  },
  errors: {
    hasDOMError: false,
    lastErrorMessage: null,
    errorTimestamp: null,
  }
};

// Create the context
const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

// Reducer function
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'LOCK_BODY':
      return {
        ...state,
        overlays: {
          ...state.overlays,
          isBodyLocked: true
        }
      };
    case 'UNLOCK_BODY':
      return {
        ...state,
        overlays: {
          ...state.overlays,
          isBodyLocked: false
        }
      };
    case 'ADD_OVERLAY':
      return {
        ...state,
        overlays: {
          ...state.overlays,
          activeOverlays: [...state.overlays.activeOverlays, action.id]
        }
      };
    case 'REMOVE_OVERLAY':
      return {
        ...state,
        overlays: {
          ...state.overlays,
          activeOverlays: state.overlays.activeOverlays.filter(id => id !== action.id)
        }
      };
    case 'CLEAR_OVERLAYS':
      return {
        ...state,
        overlays: {
          ...state.overlays,
          activeOverlays: []
        }
      };
    case 'START_NAVIGATION':
      return {
        ...state,
        navigation: {
          isNavigating: true,
          lastPathname: action.pathname,
          navigationStartTime: Date.now()
        }
      };
    case 'END_NAVIGATION':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          isNavigating: false
        }
      };
    case 'RECORD_ERROR':
      return {
        ...state,
        errors: {
          hasDOMError: true,
          lastErrorMessage: action.message,
          errorTimestamp: Date.now()
        }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: {
          hasDOMError: false,
          lastErrorMessage: null,
          errorTimestamp: null
        }
      };
    default:
      return state;
  }
}

// Create the provider
export const UIStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Define the action creators
  const lockBody = useCallback(() => {
    dispatch({ type: 'LOCK_BODY' });
  }, []);

  const unlockBody = useCallback(() => {
    dispatch({ type: 'UNLOCK_BODY' });
  }, []);

  const addOverlay = useCallback((id: string) => {
    dispatch({ type: 'ADD_OVERLAY', id });
  }, []);

  const removeOverlay = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_OVERLAY', id });
  }, []);

  const clearOverlays = useCallback(() => {
    dispatch({ type: 'CLEAR_OVERLAYS' });
  }, []);

  const startNavigation = useCallback((pathname: string) => {
    dispatch({ type: 'START_NAVIGATION', pathname });
  }, []);

  const endNavigation = useCallback(() => {
    dispatch({ type: 'END_NAVIGATION' });
  }, []);

  const recordError = useCallback((message: string) => {
    dispatch({ type: 'RECORD_ERROR', message });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const isOverlayActive = useCallback((id: string) => {
    return state.overlays.activeOverlays.includes(id);
  }, [state.overlays.activeOverlays]);

  // Apply body lock/unlock effect
  useEffect(() => {
    if (state.overlays.isBodyLocked) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('dialog-open');
    } else {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
    }

    return () => {
      // Clean up when component unmounts
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
    };
  }, [state.overlays.isBodyLocked]);

  return (
    <UIStateContext.Provider value={{
      state,
      lockBody,
      unlockBody,
      addOverlay,
      removeOverlay,
      clearOverlays,
      startNavigation,
      endNavigation,
      recordError,
      clearError,
      isOverlayActive
    }}>
      {children}
    </UIStateContext.Provider>
  );
};

// Custom hook to use the context
export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};
