
import React, { memo, useState, useMemo } from 'react';
import { MessageSquare, Filter, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import UserListItem from './UserListItem';
import SearchInput from './SearchInput';
import FilterMenu, { FilterState } from './FilterMenu';
import { useChat } from '@/context/ChatContext';

interface MobileUserListProps {
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

const MobileUserList = memo(({
  users,
  currentUserId,
  onSelectUser,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange
}: MobileUserListProps) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
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
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="md:hidden flex items-center gap-2 m-2"
          size="sm"
        >
          <MessageSquare className="h-4 w-4" />
          <span>People</span>
          {blockedCount > 0 && !showBlocked && (
            <Badge variant="secondary" className="ml-1 text-xs h-5">
              {blockedCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[85vw] max-w-[350px] sm:w-[350px]">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <SearchInput 
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search users..."
            />
          </div>
          
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-xl font-bold text-orange-500">People</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {visibleUsers.length} online
                {blockedCount > 0 && !showBlocked && ` (${blockedCount} blocked)`}
              </Badge>
              
              {blockedCount > 0 && (
                <button
                  className={`p-1 rounded-md ${
                    showBlocked ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={toggleBlockedVisibility}
                  title={showBlocked ? "Hide blocked users" : "Show blocked users"}
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              )}
              
              <button 
                className={`p-1 rounded-md ${
                  showFilterMenu ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {showFilterMenu && (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <FilterMenu 
                filters={filters}
                onChange={onFilterChange}
              />
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            {visibleUsers.length > 0 ? (
              visibleUsers.map(user => (
                <UserListItem
                  key={user.id}
                  user={user}
                  isActive={user.id === currentUserId}
                  onClick={() => {
                    onSelectUser(user);
                    // Close sheet on mobile after selection
                    const closeButton = document.querySelector('[data-radix-collection-item]');
                    if (closeButton && 'click' in closeButton) {
                      (closeButton as HTMLElement).click();
                    }
                  }}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No users found matching your criteria
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

MobileUserList.displayName = 'MobileUserList';

export default MobileUserList;
