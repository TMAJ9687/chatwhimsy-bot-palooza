
export type DialogType = 
  | 'alert' 
  | 'confirm' 
  | 'prompt' 
  | 'select'
  | 'custom';

export interface DialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: string;
  options?: { label: string; value: string }[];
  content?: React.ReactNode;
}

export interface DialogContextType {
  open: boolean;
  dialogConfig: DialogProps | null;
  openDialog: (type: DialogType, props: DialogProps) => void;
  closeDialog: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectValue: string;
  setSelectValue: (value: string) => void;
}
