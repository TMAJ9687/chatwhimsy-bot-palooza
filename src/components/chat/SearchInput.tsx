
import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = ''
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>
      <input
        type="text"
        className={`w-full rounded-lg py-2.5 pl-10 pr-4 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
