
import React from 'react';
import { Input } from '@/components/ui/input';
import { CreditCard, User, Calendar, Lock } from 'lucide-react';

interface CardInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

interface CreditCardFormProps {
  cardInfo: CardInfo;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({
  cardInfo,
  onInputChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Number</label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            className="pl-10"
            maxLength={16}
            value={cardInfo.cardNumber}
            onChange={onInputChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Cardholder Name</label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="cardholderName"
            placeholder="John Doe"
            className="pl-10"
            value={cardInfo.cardholderName}
            onChange={onInputChange}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Expiry Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="expiryDate"
              placeholder="MM/YY"
              className="pl-10"
              maxLength={5}
              value={cardInfo.expiryDate}
              onChange={onInputChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">CVV</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="cvv"
              placeholder="123"
              className="pl-10"
              maxLength={4}
              type="password"
              value={cardInfo.cvv}
              onChange={onInputChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};
