
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Crown, Check, Calendar, CreditCard, Sparkles, Trash2 } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const VipMembershipInfo = () => {
  const { user, isVip, clearUser } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Format dates for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(date, 'MMM d, yyyy');
  };
  
  const handleDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    clearUser();
    toast({
      title: "Account Deleted",
      description: "Your VIP account has been deleted successfully.",
      variant: "destructive",
    });
    setDeleteDialogOpen(false);
    
    // Redirect to home
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };
  
  // Calculate dates
  const today = new Date();
  // For the subscription end date, use the one from user context or create a default
  const subscriptionEndDate = user?.subscriptionEndDate || addMonths(today, 1);
  // Calculate start date as 30 days before end date
  const subscriptionStartDate = new Date(subscriptionEndDate);
  subscriptionStartDate.setDate(subscriptionStartDate.getDate() - 30);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md border-amber-100 dark:border-amber-900/40">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <Crown className="w-5 h-5 text-amber-500 mr-2" />
          <h2 className="text-xl font-semibold">Membership Info</h2>
        </div>
        
        {/* Current plan */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Current Plan</h3>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide opacity-80">VIP Subscription</div>
                <div className="text-xl font-bold mt-1">{user?.subscriptionTier === 'monthly' ? 'Monthly' : user?.subscriptionTier === 'semiannual' ? 'Semi-Annual' : 'Annual'} Plan</div>
              </div>
              <Sparkles className="w-6 h-6 opacity-90" />
            </div>
          </div>
        </div>
        
        {/* Subscription dates */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="flex items-center text-sm font-medium mb-1">
              <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
              Start Date
            </div>
            <div className="text-base pl-6">{formatDate(subscriptionStartDate)}</div>
          </div>
          
          <div>
            <div className="flex items-center text-sm font-medium mb-1">
              <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
              Expiration Date
            </div>
            <div className="text-base pl-6">{formatDate(subscriptionEndDate)}</div>
          </div>
          
          <div className="pt-2">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm">
              <div className="flex">
                <CreditCard className="w-4 h-4 mr-1.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-amber-800 dark:text-amber-300">Auto-Renewal:</span>
                  <span className="ml-1 text-amber-700 dark:text-amber-400">Your subscription will renew automatically unless canceled.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* VIP benefits */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">VIP Benefits</h3>
          <div className="space-y-2.5">
            {[
              'Send unlimited photos',
              'Send unlimited voice messages',
              'Chat history view',
              'Find matches by interests',
              'Customer Support',
              'Customized avatars',
              'Appear at top of the list',
              'Ad free experience'
            ].map((benefit, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-amber-100 dark:bg-amber-900/40 rounded-full p-0.5 mr-2 mt-0.5">
                  <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Account deletion */}
        <div className="space-y-3">
          <Button 
            onClick={() => setDeleteDialogOpen(true)}
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </CardContent>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default VipMembershipInfo;
