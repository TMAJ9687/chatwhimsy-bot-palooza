
import React from 'react';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const VipDowngradeDialog = () => {
  const { state, closeDialog } = useDialog();
  
  if (state.type !== 'vipDowngrade') {
    return null;
  }
  
  const userId = state.options?.userId || '';
  const username = state.options?.username || 'User';
  
  const handleConfirm = () => {
    if (state.options?.onConfirm) {
      state.options.onConfirm();
    }
    closeDialog();
  };
  
  const handleCancel = () => {
    if (state.options?.onCancel) {
      state.options.onCancel();
    }
    closeDialog();
  };
  
  return (
    <Card className="w-[400px] max-w-full mx-auto">
      <CardHeader>
        <CardTitle>Confirm VIP Downgrade</CardTitle>
        <CardDescription>
          You are about to downgrade {username} from VIP status to standard user.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-amber-600">
          This user will lose all VIP privileges immediately. This action cannot be undone.
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button variant="destructive" onClick={handleConfirm}>Confirm Downgrade</Button>
      </CardFooter>
    </Card>
  );
};

export default VipDowngradeDialog;
