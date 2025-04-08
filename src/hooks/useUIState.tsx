
import { useState, useCallback, useRef, useLayoutEffect } from 'react';

interface UIStateOptions {
  initialLocked?: boolean;
  disableTrackingEffects?: boolean;
}

/**
 * Hook to manage UI state in a declarative way
 * Completely avoids direct DOM manipulation
 */
export const useUIState = (options: UIStateOptions = {}) => {
  const { initialLocked = false, disableTrackingEffects = true } = options;
  
  // State management
  const [isBodyLocked, setIsBodyLocked] = useState(initialLocked);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Use refs to track previous values without causing re-renders
  const prevLockedRef = useRef(initialLocked);
  const firstRenderRef = useRef(true);
  
  // Body lock/unlock without DOM side effects during render
  const lockBody = useCallback(() => {
    setIsBodyLocked(true);
  }, []);
  
  const unlockBody = useCallback(() => {
    setIsBodyLocked(false);
  }, []);
  
  // Only apply body class changes in layout effect to avoid render issues
  useLayoutEffect(() => {
    // Skip effects when tracking is disabled
    if (disableTrackingEffects) return;
    
    // Skip the first render to avoid unnecessary DOM operations
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      prevLockedRef.current = isBodyLocked;
      return;
    }
    
    // Only update DOM if the lock state actually changed
    if (prevLockedRef.current !== isBodyLocked) {
      if (isBodyLocked) {
        document.body.style.overflow = 'hidden';
        document.body.classList.add('dialog-open');
      } else {
        document.body.style.overflow = '';
        document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
      }
      prevLockedRef.current = isBodyLocked;
    }
    
    // Clean up when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
    };
  }, [isBodyLocked, disableTrackingEffects]);
  
  // Overlay tracking
  const addOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => {
      if (prev.includes(id)) return prev; // Avoid duplicate additions
      return [...prev, id];
    });
  }, []);
  
  const removeOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => prev.filter(overlayId => overlayId !== id));
  }, []);
  
  const clearOverlays = useCallback(() => {
    setActiveOverlays([]);
  }, []);
  
  // Navigation state tracking
  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);
  
  const endNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);
  
  return {
    isBodyLocked,
    activeOverlays,
    isNavigating,
    isOverlayActive: useCallback((id: string) => activeOverlays.includes(id), [activeOverlays]),
    lockBody,
    unlockBody,
    addOverlay,
    removeOverlay,
    clearOverlays,
    startNavigation,
    endNavigation
  };
};

export default useUIState;
