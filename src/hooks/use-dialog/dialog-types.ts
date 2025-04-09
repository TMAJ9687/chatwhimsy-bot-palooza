
// Dialog types
export type DialogType = 'alert' | 'confirm' | 'prompt' | 'select' | 'custom' | 'report' | 'block';

// Common props interface
interface DialogBaseProps {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: (...args: any[]) => void;
  onCancel?: () => void;
}

// Props for different dialog types
export interface AlertDialogProps extends DialogBaseProps {}

export interface ConfirmDialogProps extends DialogBaseProps {
  onConfirm: () => void;
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

export interface CustomDialogProps extends DialogBaseProps {
  content: string;
  data?: any;
  onClose?: () => void;
}

// Union type for all dialog props
export type DialogProps =
  | AlertDialogProps
  | ConfirmDialogProps
  | PromptDialogProps
  | SelectDialogProps
  | ReportDialogProps
  | BlockDialogProps
  | CustomDialogProps;

// Context type
export interface DialogContextType {
  open: boolean;
  dialogConfig: DialogProps | null;
  openDialog: (type: DialogType, props: DialogProps) => void;
  closeDialog: () => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  selectValue: string;
  setSelectValue: React.Dispatch<React.SetStateAction<string>>;
}
