
import { useMemo } from 'react';
import { Bot } from '@/types/chat';

/**
 * Custom hook for calculating admin dashboard statistics
 */
export const useAdminStatsHook = (bots: Bot[], onlineUsers: string[]) => {
  // Memoized derived data to prevent unnecessary recalculations
  const vipUsers = useMemo(() => bots.filter(bot => bot.vip), [bots]);
  const standardUsers = useMemo(() => bots.filter(bot => !bot.vip), [bots]);
  const activeUsers = useMemo(() => onlineUsers.length, [onlineUsers]);
  
  return {
    vipUsers,
    standardUsers,
    activeUsers,
    totalUsers: bots.length,
    vipCount: vipUsers.length,
    standardCount: standardUsers.length
  };
};
