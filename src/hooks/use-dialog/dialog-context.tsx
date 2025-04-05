
import React, { createContext, useContext } from 'react';
import { DialogContextType, DialogType } from './dialog-types';

// Create context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Hook for using the dialog
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export default DialogContext;
