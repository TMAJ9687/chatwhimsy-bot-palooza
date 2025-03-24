
import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
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

// Available countries for filtering
const availableCountries = [
  'USA', 'UK', 'Canada', 'Australia', 'France', 'Germany', 'Italy', 'Spain', 
  'Brazil', 'Japan', 'China', 'India', 'Russia', 'South Africa', 'Mexico', 
  'Argentina', 'Egypt', 'UAE'
];

const FilterMenu: React.FC<FilterMenuProps> = ({ 
  isOpen, 
  onClose, 
  onFilterChange,
  initialFilters 
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const countriesRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
      
      // Close countries dropdown when clicking outside it
      if (countriesRef.current && !countriesRef.current.contains(event.target as Node) && showCountriesDropdown) {
        setShowCountriesDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, showCountriesDropdown]);

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

  const toggleCountry = (country: string) => {
    const currentCountries = [...filters.countries];
    const index = currentCountries.indexOf(country);
    
    if (index >= 0) {
      // Remove country if already selected
      currentCountries.splice(index, 1);
    } else {
      // Add country if not already at max selection (2)
      if (currentCountries.length < 2) {
        currentCountries.push(country);
      } else {
        // Replace the first country with the new one
        currentCountries.shift();
        currentCountries.push(country);
      }
    }
    
    handleFilterChange({ countries: currentCountries });
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

  // Calculate the percentage for the age range fill
  const ageRangePercentage = ((filters.ageRange[1] - 18) / (80 - 18)) * 100;

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
        <div className="relative h-2 bg-gray-200 rounded-lg w-full overflow-hidden">
          {/* Filled area representing the selected range */}
          <div 
            className="absolute top-0 left-0 h-full bg-teal-500 rounded-lg"
            style={{ width: `${ageRangePercentage}%` }}
          ></div>
          <input
            type="range"
            min="18"
            max="80"
            value={filters.ageRange[1]}
            onChange={(e) => handleAgeChange(parseInt(e.target.value))}
            className="w-full h-2 absolute top-0 left-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Countries */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Countries (max 2)</h4>
        <div className="relative" ref={countriesRef}>
          <button 
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-left text-gray-600 bg-gray-50 flex justify-between items-center"
            onClick={() => setShowCountriesDropdown(!showCountriesDropdown)}
          >
            <span>{filters.countries.length ? filters.countries.join(', ') : 'Select countries'}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showCountriesDropdown ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Countries dropdown */}
          {showCountriesDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {availableCountries.map((country) => (
                <div 
                  key={country}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                    filters.countries.includes(country) ? 'bg-teal-50' : ''
                  }`}
                  onClick={() => toggleCountry(country)}
                >
                  <span>{country}</span>
                  {filters.countries.includes(country) && (
                    <Check className="w-4 h-4 text-teal-500" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Selected countries as badges */}
          {filters.countries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.countries.map(country => (
                <Badge 
                  key={country} 
                  className="bg-teal-100 text-teal-800 hover:bg-teal-200"
                  onClick={() => toggleCountry(country)}
                >
                  {country}
                  <X className="w-3 h-3 ml-1 cursor-pointer" />
                </Badge>
              ))}
            </div>
          )}
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
