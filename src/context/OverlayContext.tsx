
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Define types for our overlay state
interface OverlayState {
  activeOverlays: Set<string>;
  bodyLocked: boolean;
}

type OverlayAction = 
  | { type: 'OPEN_OVERLAY'; id: string }
  | { type: 'CLOSE_OVERLAY'; id: string }
  | { type: 'CLOSE_ALL_OVERLAYS' }
  | { type: 'LOCK_BODY' }
  | { type: 'UNLOCK_BODY' };

interface OverlayContextType {
  state: OverlayState;
  openOverlay: (id: string) => void;
  closeOverlay: (id: string) => void;
  closeAllOverlays: () => void;
  lockBody: () => void;
  unlockBody: () => void;
  isOverlayActive: (id: string) => boolean;
}

const initialState: OverlayState = {
  activeOverlays: new Set<string>(),
  bodyLocked: false
};

const OverlayContext = createContext<OverlayContextType | null>(null);

function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState {
  switch (action.type) {
    case 'OPEN_OVERLAY': {
      const newActiveOverlays = new Set(state.activeOverlays);
      newActiveOverlays.add(action.id);
      return { ...state, activeOverlays: newActiveOverlays };
    }
    case 'CLOSE_OVERLAY': {
      const newActiveOverlays = new Set(state.activeOverlays);
      newActiveOverlays.delete(action.id);
      return { ...state, activeOverlays: newActiveOverlays };
    }
    case 'CLOSE_ALL_OVERLAYS':
      return { ...state, activeOverlays: new Set() };
    case 'LOCK_BODY':
      return { ...state, bodyLocked: true };
    case 'UNLOCK_BODY':
      return { ...state, bodyLocked: false };
    default:
      return state;
  }
}

export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(overlayReducer, initialState);
  
  // Apply body lock/unlock effect
  React.useEffect(() => {
    if (state.bodyLocked || state.activeOverlays.size > 0) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('dialog-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open');
    };
  }, [state.bodyLocked, state.activeOverlays]);
  
  const openOverlay = useCallback((id: string) => {
    dispatch({ type: 'OPEN_OVERLAY', id });
  }, []);
  
  const closeOverlay = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_OVERLAY', id });
  }, []);
  
  const closeAllOverlays = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_OVERLAYS' });
  }, []);
  
  const lockBody = useCallback(() => {
    dispatch({ type: 'LOCK_BODY' });
  }, []);
  
  const unlockBody = useCallback(() => {
    dispatch({ type: 'UNLOCK_BODY' });
  }, []);
  
  const isOverlayActive = useCallback((id: string) => {
    return state.activeOverlays.has(id);
  }, [state.activeOverlays]);
  
  return (
    <OverlayContext.Provider value={{
      state,
      openOverlay,
      closeOverlay,
      closeAllOverlays,
      lockBody,
      unlockBody,
      isOverlayActive
    }}>
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = (): OverlayContextType => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
};
