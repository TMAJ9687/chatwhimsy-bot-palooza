
import React, { createContext, useContext, useState } from 'react';
import { DialogContextType, DialogType, DialogProps } from './dialog-types';
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
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Create context
const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogProps | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const openDialog = <T extends DialogType>(
    type: T,
    props: any // Using any here to simplify type complexity
  ) => {
    // Set default values if provided - use type guards to check properties
    if (type === 'prompt' && 'defaultValue' in props) {
      setInputValue(props.defaultValue || '');
    } else if (type === 'select' && 'defaultValue' in props) {
      setSelectValue(props.defaultValue || '');
    } else {
      // Reset values for other dialog types
      setInputValue('');
      setSelectValue('');
    }

    setDialogConfig({ type, props } as DialogProps);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    dialogConfig?.props.onCancel?.();
    setTimeout(() => setDialogConfig(null), 300); // Clear after animation
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
        dialogConfig.props.onConfirm(inputValue);
        break;
      case 'select':
        dialogConfig.props.onConfirm(selectValue);
        break;
      case 'report':
        dialogConfig.props.onConfirm?.(inputValue);
        break;
      case 'block':
        dialogConfig.props.onBlockUser(dialogConfig.props.userId);
        break;
      case 'custom':
        // For custom dialogs, use onClose callback
        dialogConfig.props.onClose?.();
        break;
    }
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
        setSelectValue,
      }}
    >
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
              placeholder={(dialogConfig.props as any).placeholder}
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
                {(dialogConfig.props as any).options.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {dialogConfig?.type === 'custom' && (
            <div className="mt-4">
              <div className="text-center text-sm text-gray-500">
                {/* This would be replaced with dynamic content in a real implementation */}
                <p>{(dialogConfig.props as any).content}</p>
                {(dialogConfig.props as any).data && (
                  <pre className="text-xs bg-gray-100 p-2 mt-2 rounded">
                    {JSON.stringify((dialogConfig.props as any).data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>
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

export default DialogContext;
