
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
      
      // Register the overlay node once it's created
      if (overlayRef.current) {
        registerNode(overlayRef.current);
      }
    } else {
      closeOverlay(id);
      
      // Use React's state update for unmounting
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setShouldRender(false);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (isMountedRef.current) {
        closeOverlay(id);
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
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (overlayRef.current === e.target) {
      onClose();
    }
  };
  
  // Don't render if component is unmounting
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
        onClick={handleOutsideClick}
      >
        {children}
      </div>
    </Portal>
  );
};
