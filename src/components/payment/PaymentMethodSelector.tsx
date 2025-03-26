
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: 'creditCard' | 'paypal';
  onPaymentMethodChange: (value: 'creditCard' | 'paypal') => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Payment Method</label>
      <RadioGroup 
        defaultValue={paymentMethod} 
        onValueChange={(value) => onPaymentMethodChange(value as 'creditCard' | 'paypal')}
        className="flex flex-col space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="creditCard" id="creditCard" />
          <label htmlFor="creditCard" className="flex items-center gap-2 cursor-pointer">
            <CreditCard className="h-4 w-4" />
            <span>Credit Card</span>
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" />
          <label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 11l5-1 1-5c.3-1.5 1.9-2 3-1l4 3-2 7c-.2.7-.9 1-1.5 1H12" />
              <path d="M3.2 14.2C2.4 14.6 2 15.5 2 16.5C2 18.4 3.6 20 5.5 20c1.8 0 3.3-1.4 3.5-3.2l.5-3.8-5.2 1.3"/>
            </svg>
            <span>PayPal</span>
          </label>
        </div>
      </RadioGroup>
    </div>
  );
};
