
import React, { memo, useState, useMemo } from 'react';
import { Filter, EyeOff } from 'lucide-react';
import { Badge } from '../ui/badge';
import UserListItem from './UserListItem';
import SearchInput from './SearchInput';
import FilterMenu, { FilterState } from './FilterMenu';
import { useChat } from '@/context/ChatContext';

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

const UserList = memo(({
  users,
  currentUserId,
  onSelectUser,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange
}: UserListProps) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showBlocked, setShowBlocked] = useState(true); // Default to showing blocked users
  const { blockedUsers } = useChat();
  
  // Calculate stats once for performance
  const blockedCount = useMemo(() => 
    users.filter(user => blockedUsers.has(user.id)).length, 
    [users, blockedUsers]
  );
  
  // Filter visible users based on blocked status
  const visibleUsers = useMemo(() => {
    if (showBlocked) {
      return users; // Show all users including blocked
    } else {
      return users.filter(user => !blockedUsers.has(user.id));
    }
  }, [users, blockedUsers, showBlocked]);

  const toggleBlockedVisibility = () => {
    setShowBlocked(prev => !prev);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <SearchInput 
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search Keyword"
        />
      </div>
      
      <div className="flex items-center justify-between px-4 pb-2">
        <h2 className="text-xl font-bold text-orange-500">People</h2>
        <div className="relative flex gap-2">
          {blockedCount > 0 && (
            <button
              className={`px-2 py-1 rounded-md text-sm flex items-center gap-1 transition-colors ${
                showBlocked ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={toggleBlockedVisibility}
              title={showBlocked ? "Hide blocked users" : "Show blocked users"}
            >
              <EyeOff className="w-3 h-3" />
              <span>{blockedCount}</span>
            </button>
          )}
          
          <button 
            className="px-4 py-1 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter className="w-3 h-3" />
            <span>Filters</span>
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 top-full mt-1 z-10 w-72">
              <FilterMenu 
                filters={filters}
                onChange={onFilterChange}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 pb-2">
        <Badge variant="outline" className="text-sm">
          {visibleUsers.length} online
          {blockedCount > 0 && !showBlocked && ` (${blockedCount} blocked hidden)`}
        </Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto border-t border-gray-100">
        {visibleUsers.map(user => (
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
});

UserList.displayName = 'UserList';

export default UserList;
