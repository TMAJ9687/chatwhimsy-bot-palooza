
import React from 'react';
import { DialogProvider as ContextDialogProvider } from '@/context/DialogContext';

/**
 * DialogProvider component that provides dialog context to the app
 * This is a simplified version to avoid having multiple dialog providers
 */
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <ContextDialogProvider>
      {children}
    </ContextDialogProvider>
  );
};

export default DialogProvider;
