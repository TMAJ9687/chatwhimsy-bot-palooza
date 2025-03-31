
import { useState, useCallback, useMemo } from 'react';
import { Bot, FilterState } from '@/types/chat';

export const useBotFiltering = (bots: Bot[]) => {
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    country: [],
    age: [18, 50],
    vip: null
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filterBots = useCallback((botsToFilter: Bot[]) => {
    return botsToFilter.filter(bot => {
      // Name search
      if (searchTerm && !bot.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(bot.gender)) {
        return false;
      }

      // Age filter
      if (bot.age < filters.age[0] || bot.age > filters.age[1]) {
        return false;
      }

      // Country filter
      if (filters.country.length > 0 && !filters.country.includes(bot.country)) {
        return false;
      }

      // VIP filter
      if (filters.vip !== null && bot.vip !== filters.vip) {
        return false;
      }

      return true;
    });
  }, [searchTerm, filters]);

  const filteredBots = useMemo(() => filterBots(bots), [bots, filterBots]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    filteredBots,
    handleFilterChange
  };
};
