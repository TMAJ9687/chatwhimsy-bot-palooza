
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, LockIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionTier } from '@/types/user';
import { useUser } from '@/context/UserContext';
import { useVipPricing } from '@/hooks/useVipPricing';

const VipPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { subscribeToVip } = useUser();
  const { prices, loading: pricesLoading, formatPrice } = useVipPricing();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier>('monthly');
  
  // Get tier from navigation state
  useEffect(() => {
    // Check location.state first
    if (location.state && location.state.tier) {
      setTier(location.state.tier as SubscriptionTier);
    } else {
      // Fallback to URL parsing if state is not available
      const path = location.pathname;
      if (path.includes('monthly')) {
        setTier('monthly');
      } else if (path.includes('semiannual')) {
        setTier('semiannual');
      } else if (path.includes('annual')) {
        setTier('annual');
      } else {
        // Default to monthly if no tier specified
        setTier('monthly');
      }
    }
  }, [location]);
  
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < numbers.length; i += 4) {
      groups.push(numbers.slice(i, i + 4));
    }
    
    return groups.join(' ').slice(0, 19);
  };
  
  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length >= 3) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    } else {
      return numbers;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all payment details',
        variant: 'destructive'
      });
      return;
    }
    
    setProcessing(true);
    
    // Simulate payment processing
    toast({
      title: 'Processing payment',
      description: 'Please wait while we process your payment'
    });
    
    // Mock successful payment after 2 seconds
    setTimeout(() => {
      // Subscribe the user to VIP
      subscribeToVip(tier);
      
      toast({
        title: 'Payment successful!',
        description: 'Your VIP subscription has been activated'
      });
      
      // Navigate to confirmation page
      navigate('/vip-confirmation', { 
        state: { tier: tier, fromPayment: true }
      });
    }, 2000);
  };
  
  // Get price based on tier
  const getPrice = () => {
    if (pricesLoading) return '...';
    
    switch(tier) {
      case 'monthly':
        return formatPrice(prices.monthly);
      case 'semiannual':
        return formatPrice(prices.semiannual);
      case 'annual':
        return formatPrice(prices.annual);
      default:
        return formatPrice(prices.monthly);
    }
  };
  
  // Get payment period text
  const getPeriodText = () => {
    switch(tier) {
      case 'monthly':
        return 'month';
      case 'semiannual':
        return '6 months';
      case 'annual':
        return 'year';
      default:
        return 'month';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 py-10">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold">VIP Subscription</h1>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} subscription - {getPrice()} per {getPeriodText()}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  disabled={processing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    disabled={processing}
                  />
                  <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry Date</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    disabled={processing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardCvv">CVV</Label>
                  <Input
                    id="cardCvv"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCardCvv(val.slice(0, 3));
                    }}
                    maxLength={3}
                    disabled={processing}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                <LockIcon className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full" 
              size="lg" 
              disabled={processing}
              onClick={handleSubmit}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                `Pay ${getPrice()}`
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              disabled={processing}
              onClick={() => navigate('/vip-subscription')}
            >
              Back to Plans
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>This is a demo payment page. No real payments are processed.</p>
        </div>
      </div>
    </div>
  );
};

export default VipPayment;
