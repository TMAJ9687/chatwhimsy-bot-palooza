
import { useState } from 'react';
import { DialogProps } from './dialog-types';

export function useDialogState() {
  const [open, setOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogProps | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  return {
    open,
    setOpen,
    dialogConfig,
    setDialogConfig,
    inputValue,
    setInputValue,
    selectValue,
    setSelectValue
  };
}
