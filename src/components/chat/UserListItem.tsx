
import React from 'react';
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
  const genderColor = user.gender === 'female' ? 'text-pink-500' : 'text-blue-500';
  
  return (
    <div 
      className={`
        p-4 cursor-pointer transition-colors border-l-4 
        ${isActive ? 'bg-amber-50 dark:bg-amber-900/20 border-orange-500' : 'hover:bg-amber-50/50 dark:hover:bg-amber-900/10 border-transparent'}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
          ${isActive ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
          border-2 border-amber-400 dark:border-amber-600
        `}>
          {user.avatar}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
            <span className={`ml-2 ${genderColor}`}>
              {user.gender === 'female' ? 'Female' : 'Male'}, {user.age}
            </span>
            {user.vip && (
              <span className="ml-2 bg-amber-400 dark:bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                <Crown className="h-3 w-3 mr-0.5" /> VIP
              </span>
            )}
          </div>
          
          <div className="flex items-center mt-1">
            <img 
              src={`https://flagcdn.com/w20/${user.countryCode.toLowerCase()}.png`} 
              alt={user.country}
              className="w-4 h-3 mr-1 object-cover"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{user.country}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1.5">
            {user.interests.map((interest, index) => (
              <span 
                key={index}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  index % 3 === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 
                  index % 3 === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
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
};

export default UserListItem;
