
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VipDuration, AdminAction } from '@/types/admin';
import { Bot } from '@/types/chat';
import * as adminService from '@/services/admin/adminService';
import { calculateExpiryDate } from '@/utils/admin/vipUtils';

/**
 * Custom hook for VIP management functionality in the admin dashboard
 */
export const useAdminVip = (
  isAdmin: boolean, 
  user: { id: string } | null,
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>,
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>
) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const upgradeToVIP = useCallback(async (userId: string, duration: VipDuration) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsProcessing(true);
      
      // Get expiry date based on duration
      const expiryDate = calculateExpiryDate(duration);
      const expiryText = expiryDate ? 
        ` (expires on ${expiryDate.toLocaleDateString()})` : 
        ' (never expires)';
      
      // Display toast with countdown for upgrades
      toast({
        title: 'Processing VIP Upgrade',
        description: `Upgrading user to VIP for ${duration}${expiryText}`,
      });
      
      // Update bot's VIP status immediately for better UX
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      // Process the upgrade with the service
      const action = await adminService.upgradeToVIP(userId, user.id, duration);
      
      if (action) {
        // Update admin actions list
        setAdminActions(prev => [...prev, action]);
        
        toast({
          title: 'Success',
          description: `User upgraded to VIP successfully for ${duration}${expiryText}`,
        });
        
        return true;
      } else {
        // Rollback if failed
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: false } : bot
        ));
        
        toast({
          title: 'Error',
          description: 'Failed to upgrade user to VIP',
          variant: 'destructive',
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error upgrading user:', error);
      toast({
        title: 'Error',
        description: 'Failed to upgrade user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, setBots, setAdminActions]);
  
  const downgradeToStandard = useCallback(async (userId: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsProcessing(true);
      
      // Update bot's VIP status immediately for better UX
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      const action = await adminService.downgradeToStandard(userId, user.id);
      
      if (action) {
        // Update admin actions list
        setAdminActions(prev => [...prev, action]);
        
        toast({
          title: 'Success',
          description: 'User downgraded to standard successfully',
        });
        
        return true;
      } else {
        // Rollback if failed
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: true } : bot
        ));
        
        return false;
      }
    } catch (error) {
      console.error('Error downgrading user:', error);
      toast({
        title: 'Error',
        description: 'Failed to downgrade user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, setBots, setAdminActions]);

  return {
    upgradeToVIP,
    downgradeToStandard,
    isProcessing
  };
};
