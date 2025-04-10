
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDialog } from '@/hooks/use-dialog';
import { Bot } from '@/types/chat';
import { VipDuration, AdminAction } from '@/types/admin';
import { calculateExpiryDate } from '@/utils/admin/vipUtils';

/**
 * Custom hook for managing VIP users in the admin dashboard
 */
export const useAdminVipManager = (
  isAdmin: boolean,
  currentAdmin: { id: string } | null,
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>,
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>
) => {
  const { toast } = useToast();
  const { openDialog } = useDialog();
  const [isProcessing, setIsProcessing] = useState(false);

  // Show VIP duration selection dialog
  const showVipDurationSelect = useCallback((
    userId: string,
    username: string | undefined,
    onSelectDuration: (userId: string, duration: VipDuration) => void
  ) => {
    openDialog('select', {
      title: 'Select VIP Duration',
      message: `Choose the VIP duration for ${username || userId}:`,
      options: [
        { label: '1 Day', value: '1 Day' },
        { label: '1 Week', value: '1 Week' },
        { label: '1 Month', value: '1 Month' },
        { label: '1 Year', value: '1 Year' },
        { label: 'Lifetime', value: 'Lifetime' }
      ],
      confirmLabel: 'Continue',
      cancelLabel: 'Cancel',
      onConfirm: (value: string) => {
        onSelectDuration(userId, value as VipDuration);
      }
    });
  }, [openDialog]);
  
  // Show VIP confirmation dialog with expiry information
  const showVipConfirmation = useCallback((
    userId: string, 
    username: string | undefined,
    duration: VipDuration,
    onConfirm: (userId: string, duration: VipDuration) => Promise<boolean>
  ) => {
    const expiryDate = calculateExpiryDate(duration);
    const expiryText = expiryDate ? 
      `until ${expiryDate.toLocaleDateString()}` : 
      'permanently (no expiration)';
    
    openDialog('confirm', {
      title: 'Confirm VIP Upgrade',
      message: `Are you sure you want to upgrade ${username || userId} to VIP status ${expiryText}?`,
      confirmLabel: 'Upgrade to VIP',
      cancelLabel: 'Cancel',
      onConfirm: () => onConfirm(userId, duration)
    });
  }, [openDialog]);
  
  // Show VIP downgrade confirmation dialog
  const showVipDowngradeConfirmation = useCallback((
    userId: string,
    username: string | undefined,
    onConfirm: (userId: string) => Promise<boolean>
  ) => {
    openDialog('confirm', {
      title: 'Confirm VIP Downgrade',
      message: `Are you sure you want to downgrade ${username || userId} from VIP status?`,
      confirmLabel: 'Downgrade',
      cancelLabel: 'Cancel',
      onConfirm: () => onConfirm(userId)
    });
  }, [openDialog]);
  
  // Process VIP upgrade after confirmation
  const processVipUpgrade = useCallback(async (userId: string, duration: VipDuration) => {
    if (!isAdmin || !currentAdmin) return false;
    
    try {
      setIsProcessing(true);
      
      // Get expiry date based on duration for toast information
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
      
      // Mock implementation - would be a real service call in production
      const action: AdminAction = {
        id: `action-${Date.now()}`,
        actionType: "upgradeVIP",
        targetId: userId,
        targetType: "user",
        duration,
        timestamp: new Date(),
        adminId: currentAdmin.id
      };
      
      // Update admin actions list
      setAdminActions(prev => [...prev, action]);
      
      toast({
        title: 'Success',
        description: `User upgraded to VIP successfully for ${duration}${expiryText}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error upgrading user to VIP:', error);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, currentAdmin, toast, setBots, setAdminActions]);
  
  // Process VIP downgrade after confirmation
  const processVipDowngrade = useCallback(async (userId: string) => {
    if (!isAdmin || !currentAdmin) return false;
    
    try {
      setIsProcessing(true);
      
      // Update bot's VIP status immediately for better UX
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      // Mock implementation - would be a real service call in production
      const action: AdminAction = {
        id: `action-${Date.now()}`,
        actionType: "downgradeVIP",
        targetId: userId,
        targetType: "user",
        timestamp: new Date(),
        adminId: currentAdmin.id
      };
      
      // Update admin actions list
      setAdminActions(prev => [...prev, action]);
      
      toast({
        title: 'Success',
        description: 'User downgraded to standard successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error downgrading user:', error);
      
      // Rollback if failed
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      toast({
        title: 'Error',
        description: 'Failed to downgrade user',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, currentAdmin, toast, setBots, setAdminActions]);
  
  // Public methods for the hook
  const upgradeToVIP = useCallback((userId: string, username?: string) => {
    showVipDurationSelect(userId, username, (userId, duration) => {
      showVipConfirmation(userId, username, duration, processVipUpgrade);
    });
  }, [showVipDurationSelect, showVipConfirmation, processVipUpgrade]);
  
  const downgradeToStandard = useCallback((userId: string, username?: string) => {
    showVipDowngradeConfirmation(userId, username, processVipDowngrade);
  }, [showVipDowngradeConfirmation, processVipDowngrade]);
  
  return {
    upgradeToVIP,
    downgradeToStandard,
    isProcessing
  };
};
