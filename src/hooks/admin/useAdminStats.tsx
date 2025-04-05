
import { useMemo } from 'react';
import { Bot } from '@/types/chat';

/**
 * Custom hook for calculating admin dashboard statistics
 */
export const useAdminStats = (bots: Bot[]) => {
  // Memoized derived data to prevent unnecessary recalculations
  const vipUsers = useMemo(() => bots.filter(bot => bot.vip), [bots]);
  const standardUsers = useMemo(() => bots.filter(bot => !bot.vip), [bots]);
  
  return {
    vipUsers,
    standardUsers
  };
};
