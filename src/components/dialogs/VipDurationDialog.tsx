
import React, { useState } from 'react';
import { useDialog } from '@/context/DialogContext';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VipDuration } from '@/types/admin';
import { VIP_DURATION_OPTIONS } from '@/utils/admin/vipUtils';

const VipDurationDialog = () => {
  const { state, closeDialog } = useDialog();
  const [selectedDuration, setSelectedDuration] = useState<VipDuration>('1 Month');
  
  if (state.type !== 'vipDuration') {
    return null;
  }
  
  const userId = state.options?.userId || '';
  const username = state.options?.username || 'User';
  
  const handleConfirm = () => {
    if (state.options?.onSelect) {
      state.options.onSelect(selectedDuration);
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
        <CardTitle>Select VIP Duration for {username}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <RadioGroup value={selectedDuration} onValueChange={(val) => setSelectedDuration(val as VipDuration)} className="space-y-4">
          {VIP_DURATION_OPTIONS.map((duration) => (
            <div key={duration} className="flex items-center space-x-2">
              <RadioGroupItem value={duration} id={`duration-${duration}`} />
              <Label htmlFor={`duration-${duration}`} className="cursor-pointer">{duration}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm Duration</Button>
      </CardFooter>
    </Card>
  );
};

export default VipDurationDialog;
