
import { useMemo } from 'react';
import { ChatContextType } from './types/ChatContextTypes';

export const createChatContextValue = (state: any, actions: any, userIsVip: boolean): ChatContextType => {
  // Calculate filtered users
  const filteredUsers = useMemo(() => {
    let filtered = state.onlineUsers.filter((user: any) => !state.blockedUsers.includes(user.id));
    
    filtered = filtered.filter((user: any) => {
      const matchesSearch = user.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesGender = state.filters.gender === 'any' || user.gender === state.filters.gender;
      const matchesAge = user.age >= state.filters.ageRange[0] && user.age <= state.filters.ageRange[1];
      const matchesCountry = state.filters.countries.length === 0 || 
        state.filters.countries.includes(user.country);
      return matchesSearch && matchesGender && matchesAge && matchesCountry;
    });
    
    return filtered;
  }, [state.onlineUsers, state.searchTerm, state.filters, state.blockedUsers]);
  
  // Additional properties
  const isVip = userIsVip || state.currentBot?.vip || false;
  const unreadCount = useMemo(() => 
    state.unreadNotifications.filter((n: any) => !n.read).length, 
    [state.unreadNotifications]
  );

  // Compile the complete context value
  return {
    userChats: state.userChats,
    imagesRemaining: state.imagesRemaining,
    typingBots: state.typingBots,
    currentBot: state.currentBot,
    onlineUsers: state.onlineUsers,
    searchTerm: state.searchTerm,
    filters: state.filters,
    unreadNotifications: state.unreadNotifications,
    chatHistory: state.chatHistory,
    showInbox: state.showInbox,
    showHistory: state.showHistory,
    rulesAccepted: state.rulesAccepted,
    filteredUsers,
    unreadCount,
    isVip,
    setSearchTerm: state.setSearchTerm,
    setFilters: state.setFilters,
    setShowInbox: state.setShowInbox,
    setShowHistory: state.setShowHistory,
    setRulesAccepted: state.setRulesAccepted,
    ...actions
  };
};
