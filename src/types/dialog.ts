
// Dialog option types
export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface AlertDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}

export interface PromptDialogOptions {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export interface SelectDialogOptions {
  title: string;
  message: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

export interface UserEditDialogOptions {
  user: any;
  onSave: (updatedUser: any) => void;
  onCancel?: () => void;
}

export interface VipDurationDialogOptions {
  userId: string;
  username?: string;
  onSelect?: (duration: string) => void;
  onCancel?: () => void;
}

export interface VipConfirmDialogOptions {
  userId: string;
  username?: string;
  duration: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface VipDowngradeDialogOptions {
  userId: string;
  username?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Export dialog type
export type DialogType = 
  | 'confirm' 
  | 'alert' 
  | 'prompt' 
  | 'select' 
  | 'report'
  | 'block'
  | 'logout' 
  | 'vipSelect'
  | 'userEdit'
  | 'vipDuration'
  | 'vipConfirm'
  | 'vipDowngrade'
  | 'siteRules'
  | 'accountDeletion'
  | 'vipLogin'
  | 'vipSignup'
  | 'vipSubscription'
  | 'vipPayment'
  | 'vipConfirmation';
