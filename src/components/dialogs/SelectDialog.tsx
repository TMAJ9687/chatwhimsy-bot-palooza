
import React, { useState } from 'react';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectOption {
  label: string;
  value: string;
}

const SelectDialog: React.FC = () => {
  const { state, closeDialog } = useDialog();
  const [selectedValue, setSelectedValue] = useState('');
  const [error, setError] = useState('');

  const options = state.options || {};
  const title = options.title || 'Select Option';
  const message = options.message || 'Please select an option';
  const selectOptions: SelectOption[] = options.options || [];
  const confirmLabel = options.confirmLabel || 'Confirm';
  const cancelLabel = options.cancelLabel || 'Cancel';
  const required = options.required !== false;

  const handleConfirm = () => {
    if (required && !selectedValue) {
      setError('Please select an option');
      return;
    }
    
    if (options.onConfirm && typeof options.onConfirm === 'function') {
      options.onConfirm(selectedValue);
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
          <Select onValueChange={(value) => {
            setSelectedValue(value);
            setError('');
          }}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

export default SelectDialog;
