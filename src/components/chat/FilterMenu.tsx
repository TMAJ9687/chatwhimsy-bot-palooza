
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '../ui/badge';

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  gender: 'male' | 'female' | 'any';
  ageRange: [number, number];
  countries: string[];
}

const FilterMenu: React.FC<FilterMenuProps> = ({ 
  isOpen, 
  onClose, 
  onFilterChange,
  initialFilters 
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleGenderChange = (gender: 'male' | 'female' | 'any') => {
    handleFilterChange({ gender });
  };

  const handleAgeChange = (value: number) => {
    const [min, _] = filters.ageRange;
    handleFilterChange({ ageRange: [min, value] });
  };

  const handleClear = () => {
    const defaultFilters: FilterState = {
      gender: 'any',
      ageRange: [18, 80],
      countries: []
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-5"
      ref={menuRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Gender Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Gender</h4>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${filters.gender === 'male' ? 'border-teal-500' : 'border-gray-300'}`}>
              {filters.gender === 'male' && (
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              )}
            </div>
            <span>Male</span>
            <input 
              type="radio" 
              name="gender" 
              className="hidden" 
              checked={filters.gender === 'male'} 
              onChange={() => handleGenderChange('male')} 
            />
          </label>
          
          <label className="flex items-center">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${filters.gender === 'female' ? 'border-teal-500' : 'border-gray-300'}`}>
              {filters.gender === 'female' && (
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              )}
            </div>
            <span>Female</span>
            <input 
              type="radio" 
              name="gender" 
              className="hidden" 
              checked={filters.gender === 'female'} 
              onChange={() => handleGenderChange('female')} 
            />
          </label>
          
          <label className="flex items-center">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${filters.gender === 'any' ? 'border-teal-500' : 'border-gray-300'}`}>
              {filters.gender === 'any' && (
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              )}
            </div>
            <span>Any</span>
            <input 
              type="radio" 
              name="gender" 
              className="hidden" 
              checked={filters.gender === 'any'} 
              onChange={() => handleGenderChange('any')} 
            />
          </label>
        </div>
      </div>

      {/* Age Range */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <h4 className="text-sm font-medium">Age Range</h4>
          <span className="text-sm text-gray-500">18 - {filters.ageRange[1]}</span>
        </div>
        <input
          type="range"
          min="18"
          max="80"
          value={filters.ageRange[1]}
          onChange={(e) => handleAgeChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
      </div>

      {/* Countries */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Countries (max 2)</h4>
        <div className="relative">
          <button 
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-left text-gray-600 bg-gray-50 flex justify-between items-center"
          >
            <span>{filters.countries.length ? filters.countries.join(', ') : 'Select countries'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;
