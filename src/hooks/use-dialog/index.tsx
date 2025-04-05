
import React from 'react';
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
import { DialogProps, DialogContextType } from './dialog-types';
import DialogContext from './dialog-context';
import { useDialogState } from './dialog-state';

// Provider component
export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    open,
    setOpen,
    dialogConfig,
    setDialogConfig,
    inputValue,
    setInputValue,
    selectValue,
    setSelectValue
  } = useDialogState();

  const openDialog = <T extends any>(
    type: T,
    props: any
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
    <DialogContext.Provider value={{ openDialog, closeDialog } as DialogContextType}>
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

export * from './dialog-types';
export * from './dialog-context';
export * from './dialog-state';
