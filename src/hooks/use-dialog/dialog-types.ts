
export type DialogType = 
  | 'alert' 
  | 'confirm' 
  | 'prompt' 
  | 'select' 
  | 'report' 
  | 'block' 
  | 'siteRules' 
  | 'logout' 
  | 'vipLogin' 
  | 'vipSignup' 
  | 'vipSubscription' 
  | 'vipPayment' 
  | 'vipConfirmation' 
  | 'accountDeletion' 
  | 'vipSelect';

// Common props - making onConfirm optional and generic to fix the extension errors
export interface DialogBaseProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: (...args: any[]) => void; // Use generic args to allow different signatures
  onCancel?: () => void;
}

// Props for different dialog types
export interface AlertDialogProps extends DialogBaseProps {
  // Alert dialog doesn't need extra props
}

export interface ConfirmDialogProps extends DialogBaseProps {
  onConfirm: () => void; // Confirm requires onConfirm
}

export interface PromptDialogProps extends DialogBaseProps {
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
}

export interface SelectDialogProps extends DialogBaseProps {
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
  onConfirm: (value: string) => void;
}

export interface ReportDialogProps extends DialogBaseProps {
  userName: string;
  onConfirm?: (reason: string) => void;
}

export interface BlockDialogProps extends DialogBaseProps {
  userName: string;
  userId: string;
  onBlockUser: (userId: string) => void;
}

// Union of all dialog props
export type DialogProps =
  | { type: 'alert'; props: AlertDialogProps }
  | { type: 'confirm'; props: ConfirmDialogProps }
  | { type: 'prompt'; props: PromptDialogProps }
  | { type: 'select'; props: SelectDialogProps }
  | { type: 'report'; props: ReportDialogProps }
  | { type: 'block'; props: BlockDialogProps };

// Context type
export interface DialogContextType {
  openDialog: <T extends DialogType>(
    type: T,
    props: T extends 'alert'
      ? AlertDialogProps
      : T extends 'confirm'
      ? ConfirmDialogProps
      : T extends 'prompt'
      ? PromptDialogProps
      : T extends 'select'
      ? SelectDialogProps
      : T extends 'report'
      ? ReportDialogProps
      : T extends 'block'
      ? BlockDialogProps
      : never
  ) => void;
  closeDialog: () => void;
}
