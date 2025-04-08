
import { useState, useEffect, useCallback, useRef } from 'react';
import { clearTimers } from '@/utils/cleanup';

interface IdleDetectionOptions {
  idleTime?: number; // Time in ms before considered idle
  events?: string[]; // Events to listen for to reset idle timer
  onIdle?: () => void; // Callback when user becomes idle
  onActive?: () => void; // Callback when user becomes active again
  initialState?: boolean; // Initial idle state
}

/**
 * Hook to handle user idle detection in a React-friendly way
 */
export const useIdleDetection = ({
  idleTime = 5 * 60 * 1000, // Default 5 minutes
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
  onIdle,
  onActive,
  initialState = false
}: IdleDetectionOptions = {}) => {
  const [isIdle, setIsIdle] = useState(initialState);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  // Reset timer and mark as active
  const resetIdleTimer = useCallback(() => {
    if (!mountedRef.current) return;
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    // If user was idle, trigger onActive callback
    if (isIdle) {
      setIsIdle(false);
      onActive?.();
    }
    
    // Set new idle timer
    idleTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsIdle(true);
        onIdle?.();
      }
    }, idleTime);
  }, [isIdle, idleTime, onActive, onIdle]);
  
  // Set up event listeners
  useEffect(() => {
    const eventHandler = () => resetIdleTimer();
    
    // Set initial timer
    resetIdleTimer();
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, eventHandler);
    });
    
    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      // Clear timeout
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      // Remove event listeners
      events.forEach(event => {
        window.removeEventListener(event, eventHandler);
      });
    };
  }, [events, resetIdleTimer]);
  
  return { isIdle, resetIdleTimer };
};

export default useIdleDetection;
