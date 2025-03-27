import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import VipProfileForm, { VipProfileFormRef } from '@/components/profile/VipProfileForm';
import VipMembershipInfo from '@/components/profile/VipMembershipInfo';
import VipPasswordSection from '@/components/profile/VipPasswordSection';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const VipProfileSetup = () => {
  const { user, isVip, isProfileComplete, updateUserProfile } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavingDialog, setShowSavingDialog] = useState(false);
  const [navigationLock, setNavigationLock] = useState(false);
  
  const profileFormRef = useRef<VipProfileFormRef>(null);

  useEffect(() => {
    if (!isVip && user !== null) {
      toast({
        title: "VIP Access Required",
        description: "This area is exclusive to VIP members.",
        variant: "destructive"
      });
      navigate('/');
    }
    
    if (isVip && isProfileComplete) {
      toast({
        title: "Profile Already Complete",
        description: "Your VIP profile is already set up.",
      });
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    if (isVip && isProfileComplete) {
      localStorage.setItem('vipProfileComplete', 'true');
    }
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
      const modals = document.querySelectorAll('.fixed.inset-0');
      modals.forEach(modal => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      });
    };
  }, [isVip, navigate, toast, user, isProfileComplete]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      localStorage.removeItem('vipNavigationInProgress');
    };
  }, [hasUnsavedChanges]);

  const handleNavigation = (path: string) => {
    if (navigationLock) return;
    
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      setNavigationLock(true);
      
      if (isProfileComplete) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      setTimeout(() => {
        navigate(path);
        setTimeout(() => {
          setNavigationLock(false);
        }, 100);
      }, 50);
    }
  };

  const handleGoToChat = () => {
    handleNavigation('/chat');
  };

  const handleSaveAndNavigate = async () => {
    if (navigationLock) return;
    
    setNavigationLock(true);
    setShowSavingDialog(true);
    setIsSaving(true);
    
    try {
      if (profileFormRef.current) {
        const saved = await profileFormRef.current.saveForm();
        
        if (saved) {
          localStorage.setItem('vipProfileComplete', 'true');
          
          setHasUnsavedChanges(false);
          setShowUnsavedDialog(false);
          
          setTimeout(() => {
            setShowSavingDialog(false);
            
            if (pendingNavigation) {
              const destination = pendingNavigation;
              setPendingNavigation(null);
              
              setTimeout(() => {
                navigate(destination);
                setNavigationLock(false);
              }, 100);
            } else {
              setNavigationLock(false);
            }
          }, 300);
        } else {
          toast({
            title: "Error",
            description: "Please fix the form errors before continuing.",
            variant: "destructive",
          });
          setShowSavingDialog(false);
          setNavigationLock(false);
        }
      } else {
        toast({
          title: "Changes Saved",
          description: "Your profile has been updated successfully."
        });
        
        localStorage.setItem('vipProfileComplete', 'true');
        
        setHasUnsavedChanges(false);
        setShowUnsavedDialog(false);
        
        setTimeout(() => {
          setShowSavingDialog(false);
          
          if (pendingNavigation) {
            const destination = pendingNavigation;
            setPendingNavigation(null);
            
            setTimeout(() => {
              navigate(destination);
              setNavigationLock(false);
            }, 100);
          } else {
            setNavigationLock(false);
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive",
      });
      setNavigationLock(false);
    } finally {
      if (isSaving) {
        setIsSaving(false);
      }
    }
  };

  const handleDiscardAndNavigate = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    
    if (pendingNavigation) {
      const destination = pendingNavigation;
      setPendingNavigation(null);
      
      setTimeout(() => {
        navigate(destination);
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      setShowUnsavedDialog(false);
      setShowSavingDialog(false);
    };
  }, []);

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
                disabled={navigationLock}
              >
                Go to Chat
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <VipProfileForm 
                ref={profileFormRef}
                onChange={() => setHasUnsavedChanges(true)} 
                onSave={() => setHasUnsavedChanges(false)}
              />
              <VipPasswordSection />
            </div>
            
            <div className="lg:col-span-1">
              <VipMembershipInfo />
            </div>
          </div>
        </div>
      </div>

      {showUnsavedDialog && (
        <Dialog 
          open={showUnsavedDialog} 
          onOpenChange={(open) => {
            if (!open) {
              setTimeout(() => setShowUnsavedDialog(false), 100);
            }
          }}
        >
          <DialogContent
            onEscapeKeyDown={(e) => {
              if (isSaving || navigationLock) {
                e.preventDefault();
              }
            }}
          >
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. What would you like to do?
            </DialogDescription>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleDiscardAndNavigate}
                disabled={navigationLock}
              >
                Discard Changes
              </Button>
              <Button 
                onClick={handleSaveAndNavigate}
                disabled={isSaving || navigationLock}
              >
                {isSaving ? 'Saving...' : 'Save and Continue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showSavingDialog && (
        <AlertDialog 
          open={showSavingDialog}
          onOpenChange={(open) => {
            if (!open && !isSaving) {
              setTimeout(() => setShowSavingDialog(false), 100);
            }
          }}
        >
          <AlertDialogContent 
            className="max-w-[350px]"
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Saving Profile</AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col items-center justify-center py-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                Please wait while your profile is being saved...
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default VipProfileSetup;
