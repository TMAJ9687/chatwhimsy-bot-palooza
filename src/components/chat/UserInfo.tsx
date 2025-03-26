
import React from 'react';
import { Crown } from 'lucide-react';

interface UserInfoProps {
  name: string;
  age: number;
  gender: string;
  country: string;
  countryCode: string;
  isVip: boolean;
}

const UserInfo = ({ name, age, gender, country, countryCode, isVip }: UserInfoProps) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="font-medium dark:text-gray-200">{name}</span>
        {isVip && (
          <span className="bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center">
            <Crown className="h-3 w-3 mr-0.5" />
            <span>VIP</span>
          </span>
        )}
        <span className={`text-xs ${gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
          {gender === 'female' ? 'F' : 'M'}, {age}
        </span>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <img 
          src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`} 
          alt={country}
          className="w-4 h-3 mr-1"
        />
        <span>{country}</span>
      </div>
    </div>
  );
};

export default UserInfo;
