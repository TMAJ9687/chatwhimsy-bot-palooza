
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
import UserEditForm from '@/components/admin/UserEditForm';

// Dialog types
export type DialogType = 'alert' | 'confirm' | 'prompt' | 'select' | 'report' | 'block' | 'custom' | 'userEdit';

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

interface UserEditDialogProps extends DialogBaseProps {
  user: any;
  onSave: (updatedUser: any) => void;
}

interface CustomDialogProps extends DialogBaseProps {
  content: string;
  data?: any;
  onClose?: () => void;
}

// Union of all dialog props
type DialogProps =
  | { type: 'alert'; props: AlertDialogProps }
  | { type: 'confirm'; props: ConfirmDialogProps }
  | { type: 'prompt'; props: PromptDialogProps }
  | { type: 'select'; props: SelectDialogProps }
  | { type: 'report'; props: ReportDialogProps }
  | { type: 'block'; props: BlockDialogProps }
  | { type: 'userEdit'; props: UserEditDialogProps }
  | { type: 'custom'; props: CustomDialogProps };

// Context type
interface DialogContextType {
  open?: boolean;
  dialogConfig?: DialogProps | null;
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
      : T extends 'userEdit'
      ? UserEditDialogProps
      : T extends 'custom'
      ? CustomDialogProps
      : never
  ) => void;
  closeDialog: () => void;
  inputValue?: string;
  setInputValue?: React.Dispatch<React.SetStateAction<string>>;
  selectValue?: string;
  setSelectValue?: React.Dispatch<React.SetStateAction<string>>;
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
      : T extends 'userEdit'
      ? UserEditDialogProps
      : T extends 'custom'
      ? CustomDialogProps
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
      case 'custom':
        // For custom dialogs, we can use onClose callback
        dialogConfig.props.onClose?.();
        break;
      // No case for userEdit as it's handled separately with its own form
    }
    setOpen(false);
  };

  // Special handler for user edit form
  const handleUserSave = (updatedUser: any) => {
    if (!dialogConfig || dialogConfig.type !== 'userEdit') return;
    (dialogConfig.props.onSave as (user: any) => void)(updatedUser);
    setOpen(false);
  };

  return (
    <DialogContext.Provider 
      value={{ 
        open, 
        dialogConfig, 
        openDialog, 
        closeDialog,
        inputValue,
        setInputValue,
        selectValue,
        setSelectValue
      }}
    >
      {children}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogConfig?.props.title}</AlertDialogTitle>
            {dialogConfig?.type !== 'userEdit' && (
              <AlertDialogDescription className="whitespace-pre-line">
                {dialogConfig?.props.message}
              </AlertDialogDescription>
            )}
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

          {dialogConfig?.type === 'userEdit' && (
            <div className="py-2">
              <UserEditForm
                user={(dialogConfig.props as UserEditDialogProps).user}
                onSave={handleUserSave}
                onCancel={closeDialog}
              />
            </div>
          )}

          {dialogConfig?.type === 'custom' && (
            <div className="mt-4">
              <div className="text-center text-sm text-gray-500">
                Custom content: {(dialogConfig.props as CustomDialogProps).content}
              </div>
            </div>
          )}

          {dialogConfig?.type !== 'userEdit' && (
            <AlertDialogFooter>
              <AlertDialogCancel onClick={closeDialog}>
                {dialogConfig?.props.cancelLabel || 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                {dialogConfig?.props.confirmLabel || 'Continue'}
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
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
