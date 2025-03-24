
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  User, 
  Lock, 
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';

const getPlanDetails = (plan: string) => {
  switch(plan) {
    case 'monthly':
      return { 
        name: 'Monthly VIP Subscription', 
        price: '$4.99', 
        billing: 'Billed every month',
        tier: 'monthly' as const
      };
    case 'semiannual':
      return { 
        name: 'Semi-Annual VIP Subscription', 
        price: '$24.95', 
        billing: 'Billed every six months',
        tier: 'semiannual' as const
      };
    case 'annual':
      return { 
        name: 'Annual VIP Subscription', 
        price: '$39.99', 
        billing: 'Billed once a year',
        tier: 'annual' as const
      };
    default:
      return { 
        name: 'Monthly VIP Subscription', 
        price: '$4.99', 
        billing: 'Billed every month',
        tier: 'monthly' as const
      };
  }
};

const VipPaymentDialog = () => {
  const { state, closeDialog, openDialog } = useDialog();
  const { toast } = useToast();
  const { subscribeToVip } = useUser();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'paypal'>('creditCard');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });

  const selectedPlan = state.data?.selectedPlan || 'monthly';
  const planDetails = getPlanDetails(selectedPlan);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    if (paymentMethod === 'paypal') return true;
    
    const { cardNumber, cardholderName, expiryDate, cvv } = cardInfo;
    return cardNumber.length === 16 && 
           cardholderName.length > 3 && 
           /^\d{2}\/\d{2}$/.test(expiryDate) && 
           /^\d{3,4}$/.test(cvv);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Invalid Form",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing with a short delay
    setTimeout(() => {
      setIsProcessing(false);
      
      // Subscribe the user
      subscribeToVip(planDetails.tier);
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: `Your ${planDetails.name} has been activated.`,
      });
      
      // Close current dialog and open confirmation
      closeDialog();
      openDialog('vipConfirmation');
    }, 1500);
  };

  return (
    <Dialog open={state.isOpen && state.type === 'vipPayment'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl mt-4">Payment Details</DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Complete your payment to activate your VIP subscription
          </p>
        </DialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-lg my-4">
          <div className="font-medium">{planDetails.name}</div>
          <div className="text-lg font-bold">{planDetails.price}</div>
          <div className="text-sm text-muted-foreground">{planDetails.billing}</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment Method</label>
            <RadioGroup 
              defaultValue={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as 'creditCard' | 'paypal')}
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
          
          {paymentMethod === 'creditCard' ? (
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm">
                You will be redirected to PayPal to complete your payment securely.
              </p>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 gap-2" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">⭮</span>
                  Processing...
                </>
              ) : (
                <>
                  Pay {planDetails.price} Now
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            
            <div className="w-full text-center mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secure payment processing</span>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VipPaymentDialog;
