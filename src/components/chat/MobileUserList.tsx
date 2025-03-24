
import React, { memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import UserListItem from './UserListItem';
import SearchInput from './SearchInput';
import FilterMenu, { FilterState } from './FilterMenu';
import { Filter } from 'lucide-react';

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

const MobileUserList = ({
  users,
  currentUserId,
  onSelectUser,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange
}: MobileUserListProps) => {
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  
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
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
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
              <Badge variant="outline">{users.length} online</Badge>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="w-4 h-4" />
              </button>
              
              {showFilterMenu && (
                <div className="absolute right-4 top-24 z-10 w-72">
                  <FilterMenu 
                    filters={filters}
                    onChange={onFilterChange}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
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
      </SheetContent>
    </Sheet>
  );
};

export default memo(MobileUserList);
