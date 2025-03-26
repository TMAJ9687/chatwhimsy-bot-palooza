
import { useState, useCallback } from 'react';

export const useUserBlocking = () => {
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  const isUserBlocked = useCallback((userId: string) => {
    return blockedUsers.has(userId);
  }, [blockedUsers]);

  const handleBlockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
  }, []);

  const handleUnblockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  return {
    blockedUsers,
    isUserBlocked,
    handleBlockUser,
    handleUnblockUser
  };
};
