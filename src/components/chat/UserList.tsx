
import React, { memo } from 'react';
import { Filter } from 'lucide-react';
import { Badge } from '../ui/badge';
import UserListItem from './UserListItem';
import SearchInput from './SearchInput';
import FilterMenu, { FilterState } from './FilterMenu';

interface UserListProps {
  users: Array<{
    id: string;
    name: string;
    age: number;
    gender: string;
    country: string;
    countryCode: string;
    vip: boolean;
    interests: string[];
    avatar: string;
    responses: string[];
  }>;
  currentUserId: string;
  onSelectUser: (user: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const UserList = ({
  users,
  currentUserId,
  onSelectUser,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange
}: UserListProps) => {
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <SearchInput 
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search Keyword"
        />
      </div>
      
      <div className="flex items-center justify-between px-4 pb-3">
        <h2 className="text-xl font-bold text-orange-500">People</h2>
        <div className="relative">
          <button 
            className="px-4 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter className="w-3 h-3" />
            <span>Filters</span>
          </button>
          
          {showFilterMenu && (
            <FilterMenu 
              isOpen={showFilterMenu}
              onClose={() => setShowFilterMenu(false)}
              onFilterChange={onFilterChange}
              initialFilters={filters}
            />
          )}
        </div>
      </div>
      
      <div className="px-4 pb-2">
        <Badge variant="outline" className="text-sm">{users.length} online</Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto border-t border-gray-100">
        {users.map(user => (
          <UserListItem
            key={user.id}
            user={user}
            isActive={user.id === currentUserId}
            onClick={() => onSelectUser(user)}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(UserList);
