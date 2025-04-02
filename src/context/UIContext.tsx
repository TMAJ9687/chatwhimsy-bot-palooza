
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface UIContextType {
  isBodyScrollLocked: boolean;
  lockBodyScroll: () => void;
  unlockBodyScroll: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBodyScrollLocked, setIsBodyScrollLocked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const lockBodyScroll = () => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('overflow-hidden');
    setIsBodyScrollLocked(true);
  };

  const unlockBodyScroll = () => {
    document.body.style.overflow = 'auto';
    document.body.classList.remove('overflow-hidden');
    setIsBodyScrollLocked(false);
  };

  const value = useMemo(() => ({
    isBodyScrollLocked,
    lockBodyScroll,
    unlockBodyScroll,
    isMobileMenuOpen,
    setMobileMenuOpen
  }), [isBodyScrollLocked, isMobileMenuOpen]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
};
