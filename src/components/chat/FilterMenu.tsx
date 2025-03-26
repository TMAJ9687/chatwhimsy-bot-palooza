
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { countries } from '@/data/countries';

export interface FilterState {
  gender: 'any' | 'male' | 'female';
  ageRange: [number, number];
  countries: string[];
}

interface FilterMenuProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const MAX_COUNTRIES = 2;

const FilterMenu: React.FC<FilterMenuProps> = ({ filters, onChange }) => {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  
  // Auto-apply filters whenever they change
  useEffect(() => {
    onChange(tempFilters);
  }, [tempFilters, onChange]);
  
  // Count active filters (excluding default values)
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (tempFilters.gender !== 'any') count++;
    if (tempFilters.ageRange[0] > 18 || tempFilters.ageRange[1] < 80) count++;
    if (tempFilters.countries.length > 0) count++;
    return count;
  }, [tempFilters]);
  
  const handleClearFilters = () => {
    const defaultFilters = {
      gender: 'any' as const,
      ageRange: [18, 80] as [number, number],
      countries: []
    };
    setTempFilters(defaultFilters);
  };
  
  const handleCountrySelect = (country: string) => {
    if (tempFilters.countries.includes(country)) {
      setTempFilters(prev => ({
        ...prev,
        countries: prev.countries.filter(c => c !== country)
      }));
    } else {
      if (tempFilters.countries.length >= MAX_COUNTRIES) {
        // If already at max, replace the oldest one
        setTempFilters(prev => ({
          ...prev,
          countries: [...prev.countries.slice(1), country]
        }));
      } else {
        setTempFilters(prev => ({
          ...prev,
          countries: [...prev.countries, country]
        }));
      }
    }
  };
  
  const handleRemoveCountry = (country: string) => {
    setTempFilters(prev => ({
      ...prev,
      countries: prev.countries.filter(c => c !== country)
    }));
  };
  
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm space-y-4">
        {/* Gender filter */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">Gender</label>
          <Select 
            value={tempFilters.gender} 
            onValueChange={(value: any) => setTempFilters(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any gender</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Age range filter */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium dark:text-gray-300">Age range</label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tempFilters.ageRange[0]} - {tempFilters.ageRange[1]}
            </span>
          </div>
          <div className="px-1">
            <Slider 
              value={tempFilters.ageRange}
              min={18}
              max={80}
              step={1}
              onValueChange={(value: number[]) => 
                setTempFilters(prev => ({ ...prev, ageRange: value as [number, number] }))
              }
              className="[&>.relative_.absolute]:bg-green-500 [&>.relative_.absolute]:opacity-100"
            />
          </div>
        </div>
        
        {/* Country filter */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Country <span className="text-xs text-gray-500 dark:text-gray-400">(Max {MAX_COUNTRIES})</span>
          </label>
          <Select onValueChange={handleCountrySelect} disabled={tempFilters.countries.length >= MAX_COUNTRIES && !tempFilters.countries.some(c => countries.find(country => country.name === c))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select countries" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {countries.map(country => (
                <SelectItem key={country.name} value={country.name}>
                  <div className="flex items-center">
                    <span className="mr-2">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Selected countries */}
          {tempFilters.countries.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tempFilters.countries.map(country => {
                const countryData = countries.find(c => c.name === country);
                return (
                  <Badge key={country} variant="outline" className="px-2 py-1 flex items-center gap-1.5">
                    {countryData?.flag} {country}
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
