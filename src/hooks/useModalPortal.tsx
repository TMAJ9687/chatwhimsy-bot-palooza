
import { useState, useCallback, useEffect, ReactNode } from 'react';
import { useModal } from '@/context/ModalContext';

/**
 * A safer approach to modal portals using React Context
 * This is a wrapper around the ModalContext for backward compatibility
 */
export const useModalPortal = () => {
  const { openModal, closeModal, isOpen } = useModal();
  const [portalReady, setPortalReady] = useState(false);
  
  useEffect(() => {
    // Check if document is available (for SSR safety)
    if (typeof document !== 'undefined') {
      setPortalReady(true);
    }
  }, []);
  
  // Function to render content into the portal
  const renderPortal = useCallback(
    (content: ReactNode) => {
      if (!portalReady) return null;
      
      if (isOpen) {
        return content;
      }
      
      return null;
    },
    [portalReady, isOpen]
  );
  
  return {
    renderPortal,
    isOpen,
    openModal,
    closeModal,
    portalReady,
  };
};

/**
 * Modal component that uses React's Portal to render modal content
 * This uses the new ModalContext system under the hood
 */
export const ModalPortal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: ReactNode;
  className?: string;
}) => {
  const { openModal, closeModal } = useModal();
  
  useEffect(() => {
    if (isOpen) {
      openModal(
        <div className={`bg-white rounded-lg p-4 shadow-lg ${className}`}>
          {children}
        </div>
      );
    } else {
      closeModal();
    }
    
    return () => {
      if (isOpen) {
        closeModal();
      }
    };
  }, [isOpen, children, className, openModal, closeModal]);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  return null; // The actual rendering happens via the context
};
