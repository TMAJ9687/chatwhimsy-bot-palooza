
import { useState, useCallback, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * A safer approach to modal portals that prevents DOM manipulation issues
 * This hook is designed to replace direct DOM manipulation for dialogs
 */
export const useModalPortal = () => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { safeRemoveElement, isDOMReady } = useSafeDOMOperations();
  
  // Create the portal root on first use
  useEffect(() => {
    if (!isDOMReady()) return;
    
    // Create portal container if it doesn't exist already
    let portalElement = document.getElementById('modal-portal-root');
    
    if (!portalElement) {
      portalElement = document.createElement('div');
      portalElement.id = 'modal-portal-root';
      document.body.appendChild(portalElement);
    }
    
    setPortalRoot(portalElement);
    
    // Clean up on unmount
    return () => {
      if (portalElement && portalElement.childNodes.length === 0) {
        // Only remove the container if it's empty
        safeRemoveElement(portalElement);
      }
    };
  }, [isDOMReady, safeRemoveElement]);
  
  // Function to render content into the portal
  const renderPortal = useCallback(
    (content: ReactNode) => {
      if (!portalRoot) return null;
      return createPortal(content, portalRoot);
    },
    [portalRoot]
  );
  
  // Open/close functions with body class control
  const openModal = useCallback(() => {
    if (document.body) {
      document.body.classList.add('overflow-hidden', 'modal-open');
    }
    setIsOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    if (document.body) {
      document.body.classList.remove('overflow-hidden', 'modal-open');
    }
    setIsOpen(false);
  }, []);
  
  return {
    renderPortal,
    isOpen,
    openModal,
    closeModal,
    portalReady: !!portalRoot,
  };
};

/**
 * Modal component that uses React's Portal to render modal content
 * This prevents most DOM-related errors by using React's lifecycle management
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
  const { renderPortal, portalReady } = useModalPortal();
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      if (document.body) {
        document.body.classList.add('overflow-hidden', 'modal-open');
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (document.body) {
        document.body.classList.remove('overflow-hidden', 'modal-open');
      }
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !portalReady) return null;
  
  return renderPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}>
      <div 
        className="bg-white rounded-lg p-4 shadow-lg" 
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
