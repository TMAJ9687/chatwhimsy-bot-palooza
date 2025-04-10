
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VipDuration, AdminAction } from '@/types/admin';
import { Bot } from '@/types/chat';
import { upgradeToVIP, downgradeToStandard } from '@/services/admin/vipAdminService';

/**
 * Hook for managing VIP users from the admin dashboard
 */
export const useAdminVipManager = (
  isAdmin: boolean, 
  user: { id: string } | null,
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>,
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>
) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle VIP upgrade
  const handleUpgradeToVIP = useCallback(async (userId: string, userName?: string) => {
    if (!isAdmin || !user) return;
    
    try {
      setIsProcessing(true);
      
      // Update UI optimistically
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      // Default to a standard duration
      const duration = 'Lifetime';
      
      // Process the actual upgrade
      const action = await upgradeToVIP(userId, user.id, duration);
      
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
  }, [isAdmin, user, toast, setBots, setAdminActions]);
  
  // Handle VIP downgrade
  const handleDowngradeToStandard = useCallback(async (userId: string, userName?: string) => {
    if (!isAdmin || !user) return;
    
    try {
      setIsProcessing(true);
      
      // Update UI optimistically
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      // Process the actual downgrade
      const action = await downgradeToStandard(userId, user.id);
      
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
  }, [isAdmin, user, toast, setBots, setAdminActions]);

  return {
    upgradeToVIP: handleUpgradeToVIP,
    downgradeToStandard: handleDowngradeToStandard,
    isProcessing
  };
};

export default useAdminVipManager;
