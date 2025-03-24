
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

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

// Import the full list of countries
import { countries } from '@/data/countries';

// Filter out Israel from the countries list
const availableCountries = countries.filter(country => 
  country.name.toLowerCase() !== 'israel'
).sort((a, b) => a.name.localeCompare(b.name));

const FilterMenu: React.FC<FilterMenuProps> = ({ 
  isOpen, 
  onClose, 
  onFilterChange,
  initialFilters 
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
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
      // Add country if not already at max selection (3)
      if (currentCountries.length < 3) {
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
    setCountrySearchTerm('');
  };

  const filteredCountries = countrySearchTerm 
    ? availableCountries.filter(country => 
        country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()))
    : availableCountries;

  if (!isOpen) return null;

  // Calculate the percentage for the age range fill
  const ageRangePercentage = ((filters.ageRange[1] - 18) / (80 - 18)) * 100;

  return (
    <div 
      className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-5"
      ref={menuRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Gender Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Gender</h4>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${filters.gender === 'male' ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {filters.gender === 'male' && (
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              )}
            </div>
            <span className="text-sm">Male</span>
            <input 
              type="radio" 
              name="gender" 
              className="hidden" 
              checked={filters.gender === 'male'} 
              onChange={() => handleGenderChange('male')} 
            />
          </label>
          
          <label className="flex items-center">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${filters.gender === 'female' ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {filters.gender === 'female' && (
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              )}
            </div>
            <span className="text-sm">Female</span>
            <input 
              type="radio" 
              name="gender" 
              className="hidden" 
              checked={filters.gender === 'female'} 
              onChange={() => handleGenderChange('female')} 
            />
          </label>
          
          <label className="flex items-center">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${filters.gender === 'any' ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {filters.gender === 'any' && (
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              )}
            </div>
            <span className="text-sm">Any</span>
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
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-lg w-full overflow-hidden">
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
        <h4 className="text-sm font-medium mb-2">Countries (max 3)</h4>
        <div className="relative" ref={countriesRef}>
          <button 
            className="w-full py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 flex justify-between items-center"
            onClick={() => setShowCountriesDropdown(!showCountriesDropdown)}
          >
            <span>{filters.countries.length ? filters.countries.join(', ') : 'Select countries'}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showCountriesDropdown ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Countries dropdown */}
          {showCountriesDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              <div className="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search countries..."
                    className="pl-8 h-9 text-sm"
                    value={countrySearchTerm}
                    onChange={(e) => setCountrySearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredCountries.map((country) => (
                <div 
                  key={country.code}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                    filters.countries.includes(country.name) ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                  }`}
                  onClick={() => toggleCountry(country.name)}
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                  </div>
                  {filters.countries.includes(country.name) && (
                    <Check className="w-4 h-4 text-teal-500" />
                  )}
                </div>
              ))}
              
              {filteredCountries.length === 0 && (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No countries match your search
                </div>
              )}
            </div>
          )}
          
          {/* Selected countries as badges */}
          {filters.countries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.countries.map(country => {
                const countryInfo = availableCountries.find(c => c.name === country);
                return (
                  <Badge 
                    key={country} 
                    className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/40"
                    onClick={() => toggleCountry(country)}
                  >
                    {countryInfo?.flag} {country}
                    <X className="w-3 h-3 ml-1 cursor-pointer" />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-200 text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;
