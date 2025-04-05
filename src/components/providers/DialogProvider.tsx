
import React from 'react';
import { DialogProvider as ContextDialogProvider } from '@/context/DialogContext';

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return <ContextDialogProvider>{children}</ContextDialogProvider>;
};

export default DialogProvider;
