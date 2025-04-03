
import React, { useEffect, useRef, useState } from 'react';
import { Portal } from '../core/PortalManager';
import { useOverlay } from '@/context/OverlayContext';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

interface OverlayProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Overlay: React.FC<OverlayProps> = ({
  id,
  isOpen,
  onClose,
  children,
  className = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { openOverlay, closeOverlay } = useOverlay();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const { registerNode } = useSafeDOMOperations();
  const isUnmountingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  
  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Register/unregister overlay with the OverlayContext
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (isOpen) {
      openOverlay(id);
      setShouldRender(true);
      isUnmountingRef.current = false;
      
      // Register the overlay node once it's created
      if (overlayRef.current) {
        registerNode(overlayRef.current);
      }
    } else {
      closeOverlay(id);
      isUnmountingRef.current = true;
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Use a small delay before unmounting to allow for animations
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && isUnmountingRef.current) {
          setShouldRender(false);
        }
        timeoutRef.current = null;
      }, 300);
    }
    
    return () => {
      if (isMountedRef.current) {
        closeOverlay(id);
      }
      
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [id, isOpen, openOverlay, closeOverlay, registerNode]);
  
  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !isMountedRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Handle clicks outside content
  useEffect(() => {
    if (!isOpen || !isMountedRef.current) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (overlayRef.current === e.target) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);
  
  // Listen for global cleanup signals
  useEffect(() => {
    if (!isOpen || !isMountedRef.current) return;
    
    const handleCleanupSignal = () => {
      if (isOpen) {
        onClose();
      }
    };
    
    // Use a MutationObserver to watch for cleanup signals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-cleanup-overlays' || 
            mutation.attributeName === 'data-cleanup-target') {
          handleCleanupSignal();
        }
      });
    });
    
    if (document.body) {
      try {
        observer.observe(document.body, { attributes: true });
      } catch (error) {
        console.warn('Error setting up MutationObserver:', error);
      }
    }
    
    return () => {
      observer.disconnect();
    };
  }, [isOpen, onClose]);
  
  // Don't render if we shouldn't or component is unmounting
  if (!shouldRender || !isMountedRef.current) return null;
  
  // Find portal container with fallback
  const portalContainer = document.getElementById('portal-root') || document.body;
  
  return (
    <Portal container={portalContainer}>
      <div 
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-300 ${className}`}
        role="dialog"
        aria-modal="true"
        data-overlay-id={id}
      >
        {children}
      </div>
    </Portal>
  );
};
