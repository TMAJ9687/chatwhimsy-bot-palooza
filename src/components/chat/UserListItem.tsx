
import React, { memo } from 'react';
import { Crown } from 'lucide-react';
import { useChat } from '@/context/ChatContext';

interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  country: string;
  countryCode: string;
  vip: boolean;
  interests: string[];
  avatar: string;
}

interface UserListItemProps {
  user: User;
  isActive: boolean;
  onClick: () => void;
}

// Optimize with memo and custom comparison
const UserListItem: React.FC<UserListItemProps> = memo(({ user, isActive, onClick }) => {
  const { isUserBlocked, handleUnblockUser } = useChat();
  const isBlocked = isUserBlocked(user.id);
  
  const genderColor = user.gender === 'female' ? 'text-pink-500' : 'text-blue-500';
  
  const handleUnblock = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    handleUnblockUser(user.id);
  };
  
  return (
    <div 
      className={`
        py-3 px-4 cursor-pointer transition-colors border-l-4 relative
        ${isActive ? 'bg-amber-50 border-orange-500' : 'hover:bg-amber-50/50 border-transparent'}
        ${isBlocked ? 'opacity-60 grayscale' : ''}
      `}
      onClick={onClick}
    >
      {isBlocked && (
        <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-10">
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-2 text-center">
            <p className="text-gray-600 text-sm mb-2">User Blocked</p>
            <button 
              onClick={handleUnblock}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              Unblock
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
          ${isActive ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-600'}
          border-2 border-amber-400
        `}>
          {user.avatar}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
            
            <span className={`ml-2 text-xs ${genderColor}`}>
              {user.gender === 'female' ? 'F' : 'M'}, {user.age}
            </span>
            
            {user.vip && (
              <span className="ml-1 bg-amber-400 text-white text-xs px-1 py-0.5 rounded-sm flex items-center">
                <Crown className="h-3 w-3 mr-0.5" />
              </span>
            )}
          </div>
          
          <div className="flex items-center mt-1">
            <img 
              src={`https://flagcdn.com/w20/${user.countryCode.toLowerCase()}.png`} 
              alt={user.country}
              className="w-4 h-3 mr-1 object-cover"
            />
            <span className="text-xs text-gray-600">{user.country}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {user.interests.map((interest, index) => (
              <span 
                key={index}
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  index % 3 === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  index % 3 === 1 ? 'bg-blue-100 text-blue-700' : 
                  'bg-red-100 text-red-700'
                }`}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render when essential props change
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.user.id === nextProps.user.id
  );
});

UserListItem.displayName = 'UserListItem';

export default UserListItem;
