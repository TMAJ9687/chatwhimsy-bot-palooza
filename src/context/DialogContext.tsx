
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ConfirmDialogOptions, 
  AlertDialogOptions, 
  PromptDialogOptions, 
  SelectDialogOptions,
  UserEditDialogOptions,
  VipDurationDialogOptions,
  VipConfirmDialogOptions,
  VipDowngradeDialogOptions
} from '@/types/dialog';

type DialogState = {
  isOpen: boolean;
  type: 
    | 'confirm' 
    | 'alert' 
    | 'prompt' 
    | 'select' 
    | 'logout' 
    | 'vipSelect'
    | 'userEdit'
    | 'vipDuration'
    | 'vipConfirm'
    | 'vipDowngrade';
  options?: any;
};

type DialogContextType = {
  state: DialogState;
  openDialog: (
    type: DialogState['type'], 
    options?: any
  ) => void;
  closeDialog: () => void;
};

const initialState: DialogState = {
  isOpen: false,
  type: 'alert',
  options: null,
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DialogState>(initialState);

  const openDialog = (
    type: DialogState['type'], 
    options?: any
  ) => {
    setState({
      isOpen: true,
      type,
      options,
    });
  };

  const closeDialog = () => {
    setState({
      ...state,
      isOpen: false,
    });
  };

  return (
    <DialogContext.Provider value={{ state, openDialog, closeDialog }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

// Type-safe helper methods
export const useConfirmDialog = () => {
  const { openDialog } = useDialog();
  return (options: ConfirmDialogOptions) => openDialog('confirm', options);
};

export const useAlertDialog = () => {
  const { openDialog } = useDialog();
  return (options: AlertDialogOptions) => openDialog('alert', options);
};

export const usePromptDialog = () => {
  const { openDialog } = useDialog();
  return (options: PromptDialogOptions) => openDialog('prompt', options);
};

export const useSelectDialog = () => {
  const { openDialog } = useDialog();
  return (options: SelectDialogOptions) => openDialog('select', options);
};

export const useLogoutDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('logout');
};

export const useVipSelectDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('vipSelect');
};
