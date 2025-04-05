
import React, { createContext, useContext, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Dialog types
export type DialogType = 'alert' | 'confirm' | 'prompt' | 'select' | 'report' | 'block';

// Common props - making onConfirm optional and generic to fix the extension errors
interface DialogBaseProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: (...args: any[]) => void; // Use generic args to allow different signatures
  onCancel?: () => void;
}

// Props for different dialog types
interface AlertDialogProps extends DialogBaseProps {
  // Alert dialog doesn't need extra props
}

interface ConfirmDialogProps extends DialogBaseProps {
  onConfirm: () => void; // Confirm requires onConfirm
}

interface PromptDialogProps extends DialogBaseProps {
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
}

interface SelectDialogProps extends DialogBaseProps {
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
  onConfirm: (value: string) => void;
}

interface ReportDialogProps extends DialogBaseProps {
  userName: string;
  onConfirm?: (reason: string) => void;
}

interface BlockDialogProps extends DialogBaseProps {
  userName: string;
  userId: string;
  onBlockUser: (userId: string) => void;
}

// Union of all dialog props
type DialogProps =
  | { type: 'alert'; props: AlertDialogProps }
  | { type: 'confirm'; props: ConfirmDialogProps }
  | { type: 'prompt'; props: PromptDialogProps }
  | { type: 'select'; props: SelectDialogProps }
  | { type: 'report'; props: ReportDialogProps }
  | { type: 'block'; props: BlockDialogProps };

// Context type
interface DialogContextType {
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

// Create context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Provider component
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogProps | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const openDialog = <T extends DialogType>(
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
  ) => {
    // Reset state - safely handle defaultValue access
    if ('defaultValue' in props) {
      setInputValue(props.defaultValue || '');
      setSelectValue(props.defaultValue || '');
    } else {
      setInputValue('');
      setSelectValue('');
    }
    setDialogConfig({ type, props } as DialogProps);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    dialogConfig?.props.onCancel?.();
  };

  const handleConfirm = () => {
    if (!dialogConfig) return;

    switch (dialogConfig.type) {
      case 'alert':
        dialogConfig.props.onConfirm?.();
        break;
      case 'confirm':
        dialogConfig.props.onConfirm();
        break;
      case 'prompt':
        (dialogConfig.props.onConfirm as (value: string) => void)(inputValue);
        break;
      case 'select':
        (dialogConfig.props.onConfirm as (value: string) => void)(selectValue);
        break;
      case 'report':
        (dialogConfig.props.onConfirm as (reason: string) => void)?.(inputValue);
        break;
      case 'block':
        dialogConfig.props.onBlockUser(dialogConfig.props.userId);
        break;
    }
    setOpen(false);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogConfig?.props.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {dialogConfig?.props.message}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {dialogConfig?.type === 'prompt' && (
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={(dialogConfig.props as PromptDialogProps).placeholder}
              className="mt-2"
            />
          )}

          {dialogConfig?.type === 'report' && (
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe the issue"
              className="mt-2"
            />
          )}

          {dialogConfig?.type === 'select' && (
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {(dialogConfig.props as SelectDialogProps).options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>
              {dialogConfig?.props.cancelLabel || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {dialogConfig?.props.confirmLabel || 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContext.Provider>
  );
};

// Hook for using the dialog
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
