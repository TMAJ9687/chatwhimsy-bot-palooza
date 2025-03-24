
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Crown, 
  Camera, 
  Mic, 
  History, 
  Users, 
  HeadphonesIcon, 
  UserCircle,
  ArrowUp,
  BanIcon,
  MessageSquare,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { useUser } from '@/context/UserContext';

// VIP Features component for displaying benefits
const VipFeatures = () => {
  return (
    <div className="space-y-3 mt-6">
      <h3 className="font-medium text-lg border-b pb-2 dark:border-gray-700">VIP Benefits</h3>
      
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Send unlimited photos</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Send unlimited voice messages</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Chat history view</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Find matches by interests</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Customer Support</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Customized avatars</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Appear at top of the list</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Ad free experience</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">React, reply, edit, unsend messages</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">View message status</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Hide your own message status</span>
        </li>
        <li className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Control your online status</span>
        </li>
      </ul>
    </div>
  );
};

const VipSubscriptionDialog = () => {
  const { state, closeDialog, openDialog } = useDialog();
  const { isVip, subscribeToVip } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semiannual' | 'annual'>('monthly');
  
  const handleContinueToPayment = () => {
    closeDialog();
    openDialog('vipPayment', { selectedPlan });
  };

  return (
    <Dialog open={state.isOpen && state.type === 'vipSubscription'} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl mt-4">Choose Your VIP Plan</DialogTitle>
          <DialogDescription className="text-center max-w-md mx-auto">
            Unlock all premium features and enjoy an enhanced chat experience
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <RadioGroup 
            defaultValue={selectedPlan} 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onValueChange={(value) => setSelectedPlan(value as any)}
          >
            {/* Monthly Plan */}
            <div className="relative">
              <RadioGroupItem 
                value="monthly" 
                id="monthly" 
                className="sr-only" 
              />
              <label 
                htmlFor="monthly"
                className={`
                  block cursor-pointer rounded-lg border p-4 h-full
                  ${selectedPlan === 'monthly' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 ring-2 ring-amber-500' 
                    : 'bg-card border-border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'}
                `}
              >
                <CardHeader className="pb-2">
                  <CardTitle>Monthly</CardTitle>
                  <CardDescription>Billed every month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4.99</div>
                  <div className="text-muted-foreground text-sm mt-1">per month</div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    Great for trying out VIP features
                  </div>
                </CardFooter>
              </label>
            </div>

            {/* Semiannual Plan */}
            <div className="relative">
              <RadioGroupItem 
                value="semiannual" 
                id="semiannual" 
                className="sr-only" 
              />
              <label 
                htmlFor="semiannual"
                className={`
                  block cursor-pointer rounded-lg border p-4 h-full
                  ${selectedPlan === 'semiannual' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 ring-2 ring-amber-500' 
                    : 'bg-card border-border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'}
                `}
              >
                <CardHeader className="pb-2">
                  <CardTitle>Semi-Annual</CardTitle>
                  <CardDescription>Billed every six months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$24.95</div>
                  <div className="text-muted-foreground text-sm mt-1">
                    <span className="line-through text-xs mr-1">$29.94</span>
                    Save 16%
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    Best for regular users
                  </div>
                </CardFooter>
              </label>
            </div>

            {/* Annual Plan */}
            <div className="relative">
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Best Value
                </span>
              </div>
              <RadioGroupItem 
                value="annual" 
                id="annual" 
                className="sr-only" 
              />
              <label 
                htmlFor="annual"
                className={`
                  block cursor-pointer rounded-lg border p-4 h-full pt-6
                  ${selectedPlan === 'annual' 
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 ring-2 ring-amber-500' 
                    : 'bg-card border-border hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'}
                `}
              >
                <CardHeader className="pb-2">
                  <CardTitle>Annual</CardTitle>
                  <CardDescription>Billed once a year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$39.99</div>
                  <div className="text-muted-foreground text-sm mt-1">
                    <span className="line-through text-xs mr-1">$59.88</span>
                    Save 33%
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    For our most dedicated users
                  </div>
                </CardFooter>
              </label>
            </div>
          </RadioGroup>

          <VipFeatures />

          <div className="mt-8 flex justify-center">
            <Button 
              onClick={handleContinueToPayment}
              className="w-full max-w-sm bg-amber-500 hover:bg-amber-600"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VipSubscriptionDialog;
