
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import VipProfileForm from '@/components/profile/VipProfileForm';
import VipMembershipInfo from '@/components/profile/VipMembershipInfo';
import VipPasswordSection from '@/components/profile/VipPasswordSection';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/shared/ThemeToggle';

const VipProfileSetup = () => {
  const { user, isVip } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    
    // Simulate loading user data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [isVip, navigate, toast, user]);

  // Handle unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleFormSave = () => {
    setHasUnsavedChanges(false);
    toast({
      title: "Profile Saved",
      description: "Your VIP profile has been updated successfully."
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chat
          </Button>
          
          <ThemeToggle />
        </div>
      
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">VIP Profile Setup</h1>
          <p className="text-muted-foreground">
            Complete your VIP profile information to enhance your experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VipProfileForm 
              onChange={handleFormChange} 
              onSave={handleFormSave} 
            />
          </div>
          
          <div className="space-y-6">
            <VipMembershipInfo />
            <VipPasswordSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipProfileSetup;
