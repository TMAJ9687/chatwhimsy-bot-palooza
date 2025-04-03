
import React, { useEffect, useRef, useState } from 'react';
import { Portal } from '../core/PortalManager';
import { useOverlay } from '@/context/OverlayContext';

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
  
  // Register/unregister overlay with the OverlayContext
  useEffect(() => {
    if (isOpen) {
      openOverlay(id);
      setShouldRender(true);
    } else {
      closeOverlay(id);
      // Use a small delay before unmounting to allow for animations
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
    
    return () => {
      closeOverlay(id);
    };
  }, [id, isOpen, openOverlay, closeOverlay]);
  
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
      >
        {children}
      </div>
    </Portal>
  );
};
