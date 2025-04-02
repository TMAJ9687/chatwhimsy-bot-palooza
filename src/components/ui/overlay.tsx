
import React, { useEffect, useRef } from 'react';
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
  
  // Register/unregister overlay with the OverlayContext
  useEffect(() => {
    if (isOpen) {
      openOverlay(id);
    } else {
      closeOverlay(id);
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
  
  if (!isOpen) return null;
  
  return (
    <Portal container={document.getElementById('portal-root')}>
      <div 
        ref={overlayRef}
        className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </Portal>
  );
};
