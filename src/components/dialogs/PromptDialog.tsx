
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
  const options = state.options || {};
  const title = options.title || 'Prompt';
  const message = options.message || 'Please enter a value';
  const placeholder = options.placeholder || '';
  const confirmLabel = options.confirmLabel || 'Confirm';
  const cancelLabel = options.cancelLabel || 'Cancel';
  const required = options.required !== false;

  useEffect(() => {
    if (options.initialValue) {
      setValue(options.initialValue);
    }
  }, [options]);

  const handleConfirm = () => {
    if (required && !value.trim()) {
      setError('This field is required');
      return;
    }
    
    if (options.onConfirm && typeof options.onConfirm === 'function') {
      options.onConfirm(value);
    }
    closeDialog();
  };

  const handleCancel = () => {
    if (options.onCancel && typeof options.onCancel === 'function') {
      options.onCancel();
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
