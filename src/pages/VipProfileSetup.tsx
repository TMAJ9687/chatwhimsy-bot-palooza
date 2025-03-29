
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import VipProfileForm, { VipProfileFormRef } from '@/components/profile/VipProfileForm';
import VipMembershipInfo from '@/components/profile/VipMembershipInfo';
import VipPasswordSection from '@/components/profile/VipPasswordSection';
import { Crown } from 'lucide-react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileDialogs from '@/components/profile/ProfileDialogs';
import { useProfileNavigation } from '@/hooks/profile/useProfileNavigation';
import { useProfileSaving } from '@/hooks/profile/useProfileSaving';
import { performDOMCleanup } from '@/utils/errorHandler';

const VipProfileSetup = () => {
  const { user, isVip, isProfileComplete, updateUserProfile } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const profileFormRef = useRef<VipProfileFormRef>(null);

  // Custom hooks for profile management
  const {
    hasUnsavedChanges,
    showUnsavedDialog,
    pendingNavigation,
    isSaving,
    showSavingDialog,
    navigationLock,
    navigationAttemptRef,
    saveOperationTimeoutRef,
    cleanupDOM,
    handleGoToChat,
    setHasUnsavedChanges,
    setShowUnsavedDialog,
    setPendingNavigation,
    setIsSaving,
    setShowSavingDialog,
    setNavigationLock
  } = useProfileNavigation(isVip, isProfileComplete, mountedRef);

  const {
    handleSaveAndNavigate,
    handleDiscardAndNavigate
  } = useProfileSaving(
    profileFormRef,
    pendingNavigation,
    mountedRef,
    navigationAttemptRef,
    saveOperationTimeoutRef,
    setPendingNavigation,
    setHasUnsavedChanges,
    setShowUnsavedDialog,
    setShowSavingDialog,
    setNavigationLock,
    setIsSaving,
    cleanupDOM
  );

  useEffect(() => {
    mountedRef.current = true;
    
    if (!isVip && user !== null) {
      toast({
        title: "VIP Access Required",
        description: "This area is exclusive to VIP members.",
        variant: "destructive"
      });
      handleGoToChat();
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
      mountedRef.current = false;
      
      // Enhanced cleanup on unmount
      cleanupDOM();
      performDOMCleanup();
      
      // Ensure body is reset
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Clean any residual overlays
      document.querySelectorAll(
        '[role="dialog"], [aria-modal="true"], .fixed.inset-0'
      ).forEach(el => {
        try {
          if (el.parentNode) {
            el.remove();
          }
        } catch (e) {
          // Ignore removal errors
        }
      });
      
      if (saveOperationTimeoutRef.current) {
        clearTimeout(saveOperationTimeoutRef.current);
        saveOperationTimeoutRef.current = null;
      }
    };
  }, [isVip, toast, user, isProfileComplete, handleGoToChat, cleanupDOM]);

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
      
      if (saveOperationTimeoutRef.current) {
        clearTimeout(saveOperationTimeoutRef.current);
        saveOperationTimeoutRef.current = null;
      }
    };
  }, [hasUnsavedChanges]);

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
        <ProfileHeader 
          onGoToChat={handleGoToChat}
          navigationLock={navigationLock}
        />

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

      <ProfileDialogs
        showUnsavedDialog={showUnsavedDialog}
        showSavingDialog={showSavingDialog}
        isSaving={isSaving}
        navigationLock={navigationLock}
        mountedRef={mountedRef}
        onSaveAndNavigate={handleSaveAndNavigate}
        onDiscardAndNavigate={handleDiscardAndNavigate}
        setShowUnsavedDialog={setShowUnsavedDialog}
        setShowSavingDialog={setShowSavingDialog}
      />
    </>
  );
};

export default VipProfileSetup;
