
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface DialogContextType {
  openDialog: (content: React.ReactNode, options?: DialogOptions) => void;
  closeDialog: () => void;
  isOpen: boolean;
}

interface DialogOptions {
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

const DialogContext = createContext<DialogContextType>({
  openDialog: () => {},
  closeDialog: () => {},
  isOpen: false,
});

export const useDialog = () => useContext(DialogContext);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);
  const [options, setOptions] = useState<DialogOptions>({
    closeOnOutsideClick: true,
    closeOnEsc: true,
    className: '',
  });
  
  const dialogRef = useRef<HTMLDivElement>(null);

  const openDialog = (content: React.ReactNode, dialogOptions?: DialogOptions) => {
    setContent(content);
    setOptions({ ...options, ...dialogOptions });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      options.closeOnOutsideClick &&
      dialogRef.current &&
      !dialogRef.current.contains(e.target as Node)
    ) {
      closeDialog();
    }
  };

  const handleEscKey = (e: KeyboardEvent) => {
    if (options.closeOnEsc && e.key === 'Escape') {
      closeDialog();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, options.closeOnOutsideClick, options.closeOnEsc]);

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, isOpen }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div 
            ref={dialogRef}
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 ${options.className}`}
          >
            {content}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
