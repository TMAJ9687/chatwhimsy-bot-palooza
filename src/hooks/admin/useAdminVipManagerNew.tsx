
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminContext } from '@/context/AdminContext';
import { upgradeToVIP, downgradeToStandard } from '@/services/admin/vipAdminService';

/**
 * Hook for VIP user management that uses the AdminContext
 */
export const useAdminVipManager = () => {
  const { 
    isAdmin, 
    currentUser, 
    setBots, 
    setAdminActions 
  } = useAdminContext();
  
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Upgrade user to VIP
  const handleUpgradeToVIP = useCallback(async (userId: string, userName?: string) => {
    if (!isAdmin || !currentUser) return;
    
    try {
      setIsProcessing(true);
      
      // Update UI optimistically
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      // Default to a standard duration
      const duration = 'Lifetime';
      
      // Process the actual upgrade
      const action = await upgradeToVIP(userId, currentUser.id, duration);
      
      if (action) {
        // Update the admin actions list
        setAdminActions(prev => [...prev, action]);
        
        toast({
          title: 'VIP Upgraded',
          description: `${userName || 'User'} has been upgraded to VIP status`
        });
      } else {
        // Rollback if the action failed
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: false } : bot
        ));
        
        toast({
          title: 'Error',
          description: 'Failed to upgrade user to VIP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error upgrading to VIP:', error);
      
      // Rollback on error
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      toast({
        title: 'Error',
        description: 'Failed to upgrade user to VIP',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, currentUser, toast, setBots, setAdminActions]);
  
  // Downgrade user from VIP
  const handleDowngradeToStandard = useCallback(async (userId: string, userName?: string) => {
    if (!isAdmin || !currentUser) return;
    
    try {
      setIsProcessing(true);
      
      // Update UI optimistically
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      // Process the actual downgrade
      const action = await downgradeToStandard(userId, currentUser.id);
      
      if (action) {
        // Update the admin actions list
        setAdminActions(prev => [...prev, action]);
        
        toast({
          title: 'VIP Downgraded',
          description: `${userName || 'User'} has been downgraded to standard status`
        });
      } else {
        // Rollback if the action failed
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: true } : bot
        ));
        
        toast({
          title: 'Error',
          description: 'Failed to downgrade user from VIP',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error downgrading from VIP:', error);
      
      // Rollback on error
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      toast({
        title: 'Error',
        description: 'Failed to downgrade user from VIP',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, currentUser, toast, setBots, setAdminActions]);
  
  return {
    upgradeToVIP: handleUpgradeToVIP,
    downgradeToStandard: handleDowngradeToStandard,
    isProcessing
  };
};
