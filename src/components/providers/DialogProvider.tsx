
import React from 'react';
import { DialogProvider as InternalDialogProvider } from '@/hooks/use-dialog';

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return <InternalDialogProvider>{children}</InternalDialogProvider>;
};

export default DialogProvider;
