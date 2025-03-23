
import React from 'react';
import { Badge } from '../ui/badge';
import { Crown } from 'lucide-react';

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

const UserListItem: React.FC<UserListItemProps> = ({ user, isActive, onClick }) => {
  return (
    <div 
      className={`
        p-3 rounded-lg mb-2 cursor-pointer transition-colors
        ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-muted/50'}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
          ${isActive ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-600'}
        `}>
          {user.avatar}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{user.name}</span>
            {user.vip && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-sm flex items-center">
                <Crown className="h-3 w-3 mr-1" /> VIP
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm">
            <span className={user.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}>
              {user.gender === 'female' ? 'Female' : 'Male'}, {user.age}
            </span>
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
                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListItem;
