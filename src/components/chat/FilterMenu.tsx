
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { countries } from '@/data/countries';
import { FilterState } from '@/types/chat';

interface FilterMenuProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const MAX_COUNTRIES = 2;

const FilterMenu: React.FC<FilterMenuProps> = ({ filters, onChange }) => {
  const [tempFilters, setTempFilters] = useState<FilterState>({
    gender: filters.gender || [],
    country: filters.country || [],
    age: filters.age || [18, 80],
    vip: filters.vip || null,
    // For backwards compatibility
    countries: filters.country || [],
    ageRange: filters.age || [18, 80]
  });
  
  // Auto-apply filters whenever they change
  useEffect(() => {
    onChange(tempFilters);
  }, [tempFilters, onChange]);
  
  // Count active filters (excluding default values)
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (tempFilters.gender.length > 0) count++;
    if (tempFilters.age[0] > 18 || tempFilters.age[1] < 80) count++;
    if (tempFilters.country.length > 0) count++;
    return count;
  }, [tempFilters]);
  
  const handleClearFilters = () => {
    const defaultFilters: FilterState = {
      gender: [],
      country: [],
      age: [18, 80] as [number, number],
      vip: null,
      countries: [],
      ageRange: [18, 80] as [number, number]
    };
    setTempFilters(defaultFilters);
  };
  
  const handleCountrySelect = (country: string) => {
    if (tempFilters.country.includes(country)) {
      setTempFilters(prev => {
        const newCountry = prev.country.filter(c => c !== country);
        return {
          ...prev,
          country: newCountry,
          countries: newCountry // Keep in sync for backwards compatibility
        };
      });
    } else {
      if (tempFilters.country.length >= MAX_COUNTRIES) {
        // If already at max, replace the oldest one
        setTempFilters(prev => {
          const newCountry = [...prev.country.slice(1), country];
          return {
            ...prev,
            country: newCountry,
            countries: newCountry // Keep in sync for backwards compatibility
          };
        });
      } else {
        setTempFilters(prev => {
          const newCountry = [...prev.country, country];
          return {
            ...prev,
            country: newCountry,
            countries: newCountry // Keep in sync for backwards compatibility
          };
        });
      }
    }
  };
  
  const handleRemoveCountry = (country: string) => {
    setTempFilters(prev => {
      const newCountry = prev.country.filter(c => c !== country);
      return {
        ...prev,
        country: newCountry,
        countries: newCountry // Keep in sync for backwards compatibility
      };
    });
  };
  
  const handleGenderSelect = (value: string) => {
    setTempFilters(prev => {
      // Toggle gender selection
      let newGender;
      if (prev.gender.includes(value)) {
        newGender = prev.gender.filter(g => g !== value);
      } else {
        newGender = [...prev.gender, value];
      }
      return {
        ...prev,
        gender: newGender
      };
    });
  };
  
  const handleAgeChange = (value: number[]) => {
    setTempFilters(prev => ({
      ...prev,
      age: value as [number, number],
      ageRange: value as [number, number] // Keep in sync for backwards compatibility
    }));
  };
  
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        {/* Gender filter */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Gender</label>
          <div className="flex gap-2">
            <Button
              variant={tempFilters.gender.includes('male') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGenderSelect('male')}
              className="flex-1"
            >
              Male
            </Button>
            <Button
              variant={tempFilters.gender.includes('female') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleGenderSelect('female')}
              className="flex-1"
            >
              Female
            </Button>
          </div>
        </div>
        
        {/* Age range filter */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium dark:text-gray-300">Age range</label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tempFilters.age[0]} - {tempFilters.age[1]}
            </span>
          </div>
          <div className="px-1">
            <Slider 
              value={tempFilters.age}
              min={18}
              max={80}
              step={1}
              onValueChange={handleAgeChange}
              className="[&>.relative_.absolute]:bg-amber-500 dark:[&>.relative_.absolute]:bg-amber-500 [&>.relative_.absolute]:opacity-100"
            />
          </div>
        </div>
        
        {/* Country filter */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Country <span className="text-xs text-gray-500 dark:text-gray-400">(Max {MAX_COUNTRIES})</span>
          </label>
          <Select 
            onValueChange={handleCountrySelect} 
            disabled={tempFilters.country.length >= MAX_COUNTRIES}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select countries" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {countries.map(country => (
                <SelectItem key={country.name} value={country.name}>
                  <div className="flex items-center">
                    <img 
                      src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} 
                      alt={country.name}
                      className="h-3 w-4 mr-2 object-cover"
                    />
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Selected countries */}
          {tempFilters.country.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tempFilters.country.map(country => {
                const countryData = countries.find(c => c.name === country);
                return (
                  <Badge key={country} variant="outline" className="px-2 py-1 flex items-center gap-1.5">
                    <img 
                      src={`https://flagcdn.com/w20/${countryData?.code.toLowerCase()}.png`} 
                      alt={country}
                      className="h-3 w-4 object-cover"
                    />
                    {country}
                    <button 
                      onClick={() => handleRemoveCountry(country)}
                      className="ml-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        {/* VIP filter */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">User Type</label>
          <div className="flex gap-2">
            <Button
              variant={tempFilters.vip === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTempFilters(prev => ({ ...prev, vip: prev.vip === true ? null : true }))}
              className="flex-1"
            >
              VIP
            </Button>
            <Button
              variant={tempFilters.vip === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTempFilters(prev => ({ ...prev, vip: prev.vip === false ? null : false }))}
              className="flex-1"
            >
              Standard
            </Button>
          </div>
        </div>
        
        {/* Filter actions */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearFilters}
            className="w-full"
          >
            Clear all filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterMenu;
