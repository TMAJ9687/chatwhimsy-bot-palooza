
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { PaymentSummary } from '@/components/payment/PaymentSummary';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import { CreditCardForm } from '@/components/payment/CreditCardForm';
import { PaypalOption } from '@/components/payment/PaypalOption';
import { SubscriptionTier } from '@/types/user';

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

  const selectedPlan = state.options?.selectedPlan || 'monthly';
  
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
      subscribeToVip(selectedPlan as SubscriptionTier);
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: `Your subscription has been activated.`,
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
        
        <PaymentSummary selectedPlan={selectedPlan as SubscriptionTier} />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentMethodSelector 
            paymentMethod={paymentMethod} 
            onPaymentMethodChange={setPaymentMethod} 
          />
          
          {paymentMethod === 'creditCard' ? (
            <CreditCardForm 
              cardInfo={cardInfo} 
              onInputChange={handleInputChange} 
            />
          ) : (
            <PaypalOption />
          )}
          
          <DialogFooter className="mt-6">
            <button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2 py-2 px-4 rounded text-white font-medium" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">⭮</span>
                  Processing...
                </>
              ) : (
                <>
                  Pay Now
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            
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
