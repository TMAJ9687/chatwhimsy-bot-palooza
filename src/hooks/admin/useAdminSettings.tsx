
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for admin settings functionality
 */
export const useAdminSettings = (isAdmin: boolean) => {
  const { toast } = useToast();
  
  // Site settings (simulated)
  const saveSiteSettings = useCallback((settingType: string, data: any) => {
    if (!isAdmin) return false;
    
    // Save to localStorage for demonstration
    localStorage.setItem(`adminSettings_${settingType}`, JSON.stringify(data));
    
    toast({
      title: 'Success',
      description: `${settingType} settings saved successfully`,
    });
    
    return true;
  }, [isAdmin, toast]);
  
  const getSiteSettings = useCallback((settingType: string) => {
    const settings = localStorage.getItem(`adminSettings_${settingType}`);
    return settings ? JSON.parse(settings) : null;
  }, []);
  
  return {
    saveSiteSettings,
    getSiteSettings
  };
};
