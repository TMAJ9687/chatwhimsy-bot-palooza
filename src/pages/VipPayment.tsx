
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCard, Crown, Calendar, User, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '@/components/shared/ThemeToggle';

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
        price: '$24.99', 
        billing: 'Billed every six months',
        tier: 'semiannual' as const
      };
    case 'annual':
      return { 
        name: 'Annual VIP Subscription', 
        price: '$35.99', 
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

const VipPayment = () => {
  const { toast } = useToast();
  const { subscribeToVip } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const selectedPlan = searchParams.get('plan') || 'monthly';
  const email = searchParams.get('email') || '';
  const nickname = searchParams.get('nickname') || '';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'paypal'>('creditCard');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const planDetails = getPlanDetails(selectedPlan);
  
  // If no plan or email is provided, redirect back to signup
  useEffect(() => {
    if (!selectedPlan || !email) {
      navigate('/vip-subscription');
    }
  }, [selectedPlan, email, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number to include spaces every 4 digits
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setCardInfo(prev => ({
        ...prev,
        [name]: formatted.substring(0, 19) // limit to 16 digits + 3 spaces
      }));
      return;
    }
    
    // Format expiry date as MM/YY
    if (name === 'expiryDate') {
      let formatted = value.replace(/\D/g, ''); // Remove non-digits
      if (formatted.length > 2) {
        formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}`;
      }
      setCardInfo(prev => ({
        ...prev,
        [name]: formatted
      }));
      return;
    }
    
    setCardInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const isFormValid = () => {
    if (paymentMethod === 'paypal') return true;
    
    const { cardNumber, cardholderName, expiryDate, cvv } = cardInfo;
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    return cleanCardNumber.length === 16 && 
           cardholderName.length > 3 && 
           /^\d{2}\/\d{2}$/.test(expiryDate) && 
           /^\d{3,4}$/.test(cvv);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Invalid Payment Information",
        description: "Please fill in all required payment fields correctly.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Subscribe the user
      subscribeToVip(planDetails.tier);
      
      // Show success toast
      toast({
        title: "Payment Successful",
        description: `Your ${planDetails.name} has been activated.`,
      });
      
      // Navigate to confirmation page
      navigate('/vip-confirmation');
    }, 2000);
  };
  
  const handleBackToSignup = () => {
    navigate(`/vip-signup?plan=${selectedPlan}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={handleBackToSignup} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign Up</span>
          </Button>
          <ThemeToggle />
        </div>
        
        <Card className="border-amber-100 dark:border-amber-900/40 shadow-lg">
          <CardHeader className="pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
              <Crown className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle className="text-center text-xl">Payment Details</CardTitle>
            <CardDescription className="text-center">
              Complete your payment to activate VIP status
            </CardDescription>
          </CardHeader>
          
          <div className="mx-4 bg-muted/50 p-3 rounded-lg my-2">
            <div className="font-medium">{planDetails.name}</div>
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">{planDetails.price}</div>
              <div className="text-sm text-muted-foreground">{planDetails.billing}</div>
            </div>
          </div>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Payment Method</Label>
                <RadioGroup 
                  defaultValue={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as 'creditCard' | 'paypal')}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value="creditCard" id="creditCard" />
                    <Label htmlFor="creditCard" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-md">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 11l5-1 1-5c.3-1.5 1.9-2 3-1l4 3-2 7c-.2.7-.9 1-1.5 1H12" />
                        <path d="M3.2 14.2C2.4 14.6 2 15.5 2 16.5C2 18.4 3.6 20 5.5 20c1.8 0 3.3-1.4 3.5-3.2l.5-3.8-5.2 1.3"/>
                      </svg>
                      <span>PayPal</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {paymentMethod === 'creditCard' ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="pl-10"
                        value={cardInfo.cardNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cardholder Name</Label>
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
                      <Label className="text-sm font-medium">Expiry Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="expiryDate"
                          placeholder="MM/YY"
                          className="pl-10"
                          value={cardInfo.expiryDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">CVV</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="cvv"
                          placeholder="123"
                          className="pl-10"
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
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex items-center justify-center gap-2 py-6 h-auto text-base" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin">⭮</span>
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {planDetails.price}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="w-full text-center mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>Secure payment processing</span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VipPayment;
