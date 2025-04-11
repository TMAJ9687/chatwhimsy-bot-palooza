
import React from 'react';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateExpiryDate } from '@/utils/admin/vipUtils';
import { VipDuration } from '@/types/admin';

const VipConfirmDialog = () => {
  const { state, closeDialog } = useDialog();
  
  if (state.type !== 'vipConfirm') {
    return null;
  }
  
  const userId = state.options?.userId || '';
  const username = state.options?.username || 'User';
  const duration = state.options?.duration as VipDuration || '1 Month';
  
  // Calculate expiry date if not lifetime
  const expiryDate = calculateExpiryDate(duration);
  const expiryText = expiryDate ? 
    ` until ${expiryDate.toLocaleDateString()}` : 
    ' permanently';
  
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
        <CardTitle>Confirm VIP Upgrade</CardTitle>
        <CardDescription>
          You are about to upgrade {username} to VIP status{expiryText}.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p>VIP Duration: <strong>{duration}</strong></p>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm Upgrade</Button>
      </CardFooter>
    </Card>
  );
};

export default VipConfirmDialog;
