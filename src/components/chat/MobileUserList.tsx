
import React, { useState } from 'react';
import { Users, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import UserList from './UserList';
import { FilterState } from './FilterMenu';

interface MobileUserListProps {
  users: any[];
  currentUserId: string;
  onSelectUser: (user: any) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const MobileUserList: React.FC<MobileUserListProps> = ({
  users,
  currentUserId,
  onSelectUser,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange
}) => {
  const [open, setOpen] = useState(false);
  
  const handleUserSelect = (user: any) => {
    onSelectUser(user);
    setOpen(false);
  };
  
  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-md fixed bottom-4 left-4 z-20"
            aria-label="Open user list"
          >
            <Users className="h-6 w-6" />
          </button>
        </SheetTrigger>
        
        <SheetContent side="left" className="p-0 w-[90%] sm:w-[350px]">
          <SheetHeader className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <SheetTitle className="text-xl font-bold text-orange-500">People</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 h-[calc(100vh-70px)] overflow-hidden">
            <UserList
              users={users}
              currentUserId={currentUserId}
              onSelectUser={handleUserSelect}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileUserList;
