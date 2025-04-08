
import { useState, useCallback } from 'react';

interface UIStateOptions {
  initialLocked?: boolean;
}

/**
 * Hook to manage UI state in a declarative way
 * Replaces direct DOM manipulation with React state
 */
export const useUIState = (options: UIStateOptions = {}) => {
  const { initialLocked = false } = options;
  
  const [isBodyLocked, setIsBodyLocked] = useState(initialLocked);
  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const lockBody = useCallback(() => {
    setIsBodyLocked(true);
    // Apply class via state rather than direct manipulation
  }, []);
  
  const unlockBody = useCallback(() => {
    setIsBodyLocked(false);
    // Remove class via state rather than direct manipulation
  }, []);
  
  const addOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => [...prev, id]);
  }, []);
  
  const removeOverlay = useCallback((id: string) => {
    setActiveOverlays(prev => prev.filter(overlayId => overlayId !== id));
  }, []);
  
  const clearOverlays = useCallback(() => {
    setActiveOverlays([]);
  }, []);
  
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
    isOverlayActive: (id: string) => activeOverlays.includes(id),
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
