
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import VipProfileForm from '@/components/profile/VipProfileForm';
import VipMembershipInfo from '@/components/profile/VipMembershipInfo';
import VipPasswordSection from '@/components/profile/VipPasswordSection';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const VipProfileSetup = () => {
  const { user, isVip, isProfileComplete, updateUserProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    // Redirect non-VIP users
    if (!isVip && user !== null) {
      toast({
        title: "VIP Access Required",
        description: "This area is exclusive to VIP members.",
        variant: "destructive"
      });
      navigate('/');
    }
    
    // If profile is complete and the user tries to access this page again, redirect to chat
    if (isVip && isProfileComplete) {
      toast({
        title: "Profile Already Complete",
        description: "Your VIP profile is already set up.",
      });
      // Don't redirect automatically, let them edit their profile if they want
    }
    
    // Simulate loading user data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [isVip, navigate, toast, user, isProfileComplete]);

  // Custom navigation handler that checks for unsaved changes
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };

  const handleGoToChat = () => {
    handleNavigation('/chat');
  };

  const handleSaveAndNavigate = () => {
    // Here we would normally save the form
    toast({
      title: "Changes Saved",
      description: "Your profile has been updated successfully."
    });
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleDiscardAndNavigate = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="animate-pulse flex flex-col items-center">
          <Crown className="w-12 h-12 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading VIP Profile</h1>
          <p className="text-muted-foreground">Preparing your exclusive experience...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-6 px-4 md:px-8 shadow-md">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">VIP Profile Setup</h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle className="bg-white/10 text-white hover:bg-white/20" />
              <Button 
                onClick={handleGoToChat} 
                variant="outline" 
                className="border-white/30 bg-white/10 hover:bg-white/20 text-white"
              >
                Go to Chat
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - 2/3 width on desktop */}
            <div className="lg:col-span-2 space-y-8">
              <VipProfileForm 
                onChange={() => setHasUnsavedChanges(true)} 
                onSave={() => setHasUnsavedChanges(false)}
              />
              <VipPasswordSection />
            </div>
            
            {/* Sidebar - 1/3 width on desktop */}
            <div className="lg:col-span-1">
              <VipMembershipInfo />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogTitle>Unsaved Changes</DialogTitle>
          <DialogDescription>
            You have unsaved changes. What would you like to do?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={handleDiscardAndNavigate}>
              Discard Changes
            </Button>
            <Button onClick={handleSaveAndNavigate}>
              Save and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VipProfileSetup;
