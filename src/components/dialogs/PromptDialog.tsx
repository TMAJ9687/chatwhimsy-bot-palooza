
import React, { useState, useEffect } from 'react';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const PromptDialog: React.FC = () => {
  const { state, closeDialog } = useDialog();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const title = state.data?.title || 'Prompt';
  const message = state.data?.message || 'Please enter a value';
  const placeholder = state.data?.placeholder || '';
  const confirmLabel = state.data?.confirmLabel || 'Confirm';
  const cancelLabel = state.data?.cancelLabel || 'Cancel';
  const required = state.data?.required !== false;

  useEffect(() => {
    if (state.data?.initialValue) {
      setValue(state.data.initialValue);
    }
  }, [state.data]);

  const handleConfirm = () => {
    if (required && !value.trim()) {
      setError('This field is required');
      return;
    }
    
    if (state.data?.onConfirm && typeof state.data.onConfirm === 'function') {
      state.data.onConfirm(value);
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (state.data?.onCancel && typeof state.data.onCancel === 'function') {
      state.data.onCancel();
    }
    closeDialog();
  };

  return (
    <Dialog open={true} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            placeholder={placeholder}
            className={error ? 'border-red-500' : ''}
            autoFocus
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDialog;
