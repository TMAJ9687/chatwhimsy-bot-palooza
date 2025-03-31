
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

type ModalContextType = {
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  isOpen: boolean;
};

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
  isOpen: false,
});

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Create modal root once on mount
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    let root = document.getElementById('modal-root');
    
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    
    setPortalRoot(root);
    
    // Cleanup on unmount
    return () => {
      // Only remove if it's empty and we created it
      if (root && root.childNodes.length === 0) {
        try {
          document.body.removeChild(root);
        } catch (e) {
          console.warn('Error removing modal root:', e);
        }
      }
    };
  }, []);

  // Handle body class for preventing scroll when modal is open
  useEffect(() => {
    if (isOpen && document.body) {
      document.body.classList.add('overflow-hidden');
    } else if (document.body) {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      if (document.body) {
        document.body.classList.remove('overflow-hidden');
      }
    };
  }, [isOpen]);

  // Modal context value
  const value = useMemo(() => ({
    openModal: (content: React.ReactNode) => {
      setModalContent(content);
      setIsOpen(true);
    },
    closeModal: () => {
      setIsOpen(false);
      // Small delay to allow exit animations to complete
      setTimeout(() => {
        setModalContent(null);
      }, 100);
    },
    isOpen
  }), [isOpen]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {portalRoot && modalContent && createPortal(
        <div 
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 150ms ease-in-out' }}
          onClick={() => value.closeModal()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {modalContent}
          </div>
        </div>,
        portalRoot
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
