
import { useState, useMemo, useCallback } from 'react';
import { Bot, FilterState } from '@/types/chat';
import { sortUsers } from '@/utils/botUtils';

export const DEFAULT_FILTERS: FilterState = {
  gender: 'any',
  ageRange: [18, 80],
  countries: []
};

export const useBotFiltering = (
  initialBots: Bot[], 
  blockedUsers: Set<string>
) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Filter users based on criteria
  const filteredUsers = useMemo(() => {
    return initialBots.filter(user => {
      // Search filter
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Gender filter
      const matchesGender = filters.gender === 'any' || user.gender === filters.gender;
      
      // Age range filter
      const matchesAge = user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1];
      
      // Country filter
      const matchesCountry = filters.countries.length === 0 || 
        filters.countries.includes(user.country);
        
      return matchesSearch && matchesGender && matchesAge && matchesCountry;
    });
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
