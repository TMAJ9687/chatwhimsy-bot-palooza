
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ConfirmDialogOptions, 
  AlertDialogOptions, 
  PromptDialogOptions, 
  SelectDialogOptions,
  UserEditDialogOptions,
  VipDurationDialogOptions,
  VipConfirmDialogOptions,
  VipDowngradeDialogOptions,
  DialogType
} from '@/types/dialog';

export type { DialogType } from '@/types/dialog';

type DialogState = {
  isOpen: boolean;
  type: DialogType;
  options?: any;
};

type DialogContextType = {
  state: DialogState;
  openDialog: (
    type: DialogType, 
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
    type: DialogType, 
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

export const useReportDialog = () => {
  const { openDialog } = useDialog();
  return (options: any) => openDialog('report', options);
};

export const useBlockDialog = () => {
  const { openDialog } = useDialog();
  return (options: any) => openDialog('block', options);
};

export const useSiteRulesDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('siteRules');
};

export const useAccountDeletionDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('accountDeletion');
};

export const useVipLoginDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('vipLogin');
};

export const useVipSignupDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('vipSignup');
};

export const useVipSubscriptionDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('vipSubscription');
};

export const useVipPaymentDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('vipPayment');
};

export const useVipConfirmationDialog = () => {
  const { openDialog } = useDialog();
  return () => openDialog('vipConfirmation');
};
