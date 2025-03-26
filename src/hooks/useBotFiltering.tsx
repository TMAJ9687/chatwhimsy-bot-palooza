
import { useState, useMemo, useCallback } from 'react';
import { Bot, FilterState } from '@/types/chat';
import { sortUsers } from '@/utils/botUtils';

export const useBotFiltering = (initialBots: Bot[], blockedUsers: Set<string>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    gender: 'any',
    ageRange: [18, 80],
    countries: []
  });

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const filteredUsers = useMemo(() => {
    const filtered = initialBots.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = filters.gender === 'any' || user.gender === filters.gender;
      const matchesAge = user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1];
      const matchesCountry = filters.countries.length === 0 || 
        filters.countries.includes(user.country);
      return matchesSearch && matchesGender && matchesAge && matchesCountry;
    });
    return filtered;
  }, [initialBots, searchTerm, filters]);

  // Create a memoized list of visible users (not blocked)
  const visibleUsers = useMemo(() => 
    filteredUsers.filter(user => !blockedUsers.has(user.id)),
    [filteredUsers, blockedUsers]
  );

  return {
    searchTerm,
    filters,
    filteredUsers,
    visibleUsers,
    setSearchTerm,
    setFilters,
    handleFilterChange
  };
};
