
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
  
  // Register/unregister overlay with the OverlayContext
  useEffect(() => {
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
        if (isUnmountingRef.current) {
          setShouldRender(false);
        }
        timeoutRef.current = null;
      }, 300);
    }
    
    return () => {
      closeOverlay(id);
      
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [id, isOpen, openOverlay, closeOverlay, registerNode]);
  
  // Handle ESC key
  useEffect(() => {
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
    const handleOutsideClick = (e: MouseEvent) => {
      if (overlayRef.current === e.target) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  // Listen for global cleanup signals
  useEffect(() => {
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
      observer.observe(document.body, { attributes: true });
    }
    
    return () => {
      observer.disconnect();
    };
  }, [isOpen, onClose]);
  
  if (!shouldRender) return null;
  
  return (
    <Portal container={document.getElementById('portal-root')}>
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
