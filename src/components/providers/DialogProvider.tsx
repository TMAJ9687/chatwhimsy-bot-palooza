
import React from 'react';
// Import both dialog providers
import { DialogProvider as ContextDialogProvider } from '@/context/DialogContext';
import { DialogProvider as HooksDialogProvider } from '@/hooks/use-dialog';

// Wrapper component that combines both dialog providers
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <ContextDialogProvider>
      <HooksDialogProvider>
        {children}
      </HooksDialogProvider>
    </ContextDialogProvider>
  );
};

export default DialogProvider;
