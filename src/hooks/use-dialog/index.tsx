
import React, { createContext, useContext, useState } from 'react';
import { DialogContextType, DialogType, DialogProps } from './dialog-types';

// Create context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogProps | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const openDialog = (type: DialogType, props: DialogProps) => {
    // Set default values if provided - use type guards to check properties
    if (type === 'prompt' && 'defaultValue' in props) {
      setInputValue(props.defaultValue || '');
    } else if (type === 'select' && 'defaultValue' in props) {
      setSelectValue(props.defaultValue || '');
    } else {
      // Reset values for other dialog types
      setInputValue('');
      setSelectValue('');
    }

    setDialogConfig(props);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setTimeout(() => setDialogConfig(null), 300); // Clear after animation
  };

  return (
    <DialogContext.Provider
      value={{
        open,
        dialogConfig,
        openDialog,
        closeDialog,
        inputValue,
        setInputValue,
        selectValue,
        setSelectValue,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

// Hook for using the dialog
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export default DialogContext;
