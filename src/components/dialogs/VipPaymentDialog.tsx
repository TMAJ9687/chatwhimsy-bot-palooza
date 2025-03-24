
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  CreditCardIcon, 
  User, 
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const paymentSchema = z.object({
  paymentMethod: z.enum(['creditCard', 'paypal']),
  // Card details (only required if paymentMethod is creditCard)
  cardNumber: z.string().optional()
    .refine(val => !val || /^[0-9]{16}$/.test(val), {
      message: "Card number must be 16 digits"
    }),
  cardholderName: z.string().optional()
    .refine(val => !val || val.length > 3, {
      message: "Cardholder name is required"
    }),
  expiryDate: z.string().optional()
    .refine(val => !val || /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(val), {
      message: "Expiry date must be in MM/YY format"
    }),
  cvv: z.string().optional()
    .refine(val => !val || /^[0-9]{3,4}$/.test(val), {
      message: "CVV must be 3 or 4 digits"
    }),
}).refine(
  (data) => {
    if (data.paymentMethod === 'creditCard') {
      return !!data.cardNumber && !!data.cardholderName && !!data.expiryDate && !!data.cvv;
    }
    return true;
  },
  {
    message: "Card details are required for credit card payment",
    path: ["cardNumber"],
  }
);

type PaymentFormValues = z.infer<typeof paymentSchema>;

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
  
  const selectedPlan = state.data?.selectedPlan || 'monthly';
  const planDetails = getPlanDetails(selectedPlan);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'creditCard',
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
    },
  });

  const paymentMethod = form.watch('paymentMethod');

  const handlePayment = (values: PaymentFormValues) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Subscribe the user
      subscribeToVip(planDetails.tier);
      
      // Show success message
      toast({
        title: "Payment Successful",
        description: `Your ${planDetails.name} has been activated.`,
      });
      
      // Close current dialog and open confirmation
      closeDialog();
      openDialog('vipConfirmation');
    }, 2000);
  };

  return (
    <Dialog open={state.isOpen && state.type === 'vipPayment'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <span>Payment Details</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Complete your payment to activate your VIP subscription
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <div className="font-medium">{planDetails.name}</div>
          <div className="text-lg font-bold">{planDetails.price}</div>
          <div className="text-sm text-muted-foreground">{planDetails.billing}</div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="creditCard" id="creditCard" />
                        <label htmlFor="creditCard" className="flex items-center gap-2 cursor-pointer">
                          <CreditCardIcon className="h-4 w-4" />
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {paymentMethod === 'creditCard' && (
              <>
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="1234 5678 9012 3456" 
                            className="pl-10"
                            maxLength={16}
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="John Doe" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="MM/YY" 
                              className="pl-10"
                              maxLength={5}
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="123" 
                              className="pl-10"
                              maxLength={4}
                              type="password"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
            
            {paymentMethod === 'paypal' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-sm">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full mt-2 bg-amber-500 hover:bg-amber-600" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⭮</span>
                    Processing...
                  </>
                ) : (
                  `Pay ${planDetails.price} Now`
                )}
              </Button>
              
              <div className="w-full text-center mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure payment by Stripe</span>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VipPaymentDialog;
