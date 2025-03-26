
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

// Mock GIF data - in a real app, this would come from a GIF API like Giphy or Tenor
const MOCK_GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmxyZW53ejBxeWYxaW5wcmtkczRkcTZ2azkzajB5ejNtNG8wdTUxcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/S9oNGC1E42VT2JRysv/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmQ2Mjg3bDJ5YTYzYWw4b214Znl2MGUzbGIweWU5cHhzaG03MHlldCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HloNK1z39EkEQcreIo/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnE2NGxmbXVzaHY0NmdkMzQ5eno2NTE1eXZ0cm9iOHB4NDJucXZidyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TvLuZ00OIADoQ/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmRveXZscWc5cXdseWJwYm5yMDdldm50OWU1ZnIyYXZndWhzZXJxcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/blSTtZehjAZ8I/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXZ0aDRpYWp2ZGJobGJ3cWJzdWluejN5NW40bGw1cWo0eTRtZHNkZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lZccR1oUigYeNa/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzk0ZnlzZXlrMDU2NjZ0d3VrNXdlaTExenNnbmNyNnQ2eXN5ZXV0ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZIG63RdogCgLe/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGFqczJpb2FlMHhwcWlxYnlwenM0aGp0ZjlscmV0a2YwOXJuMnVhaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26FLdmIp6wJr91JAI/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGxxMm9mYWVxZmJvZXRmeGsxZjFmZHpqdDNya2hqeWpydW55MGFpcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ule4vhcY1xEKQ/giphy.gif'
];

const TRENDING_CATEGORIES = [
  'Reactions', 'Funny', 'Love', 'Sad', 'Sports', 'Anime', 'Movies', 'Animals'
];

const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentGifs, setCurrentGifs] = useState(MOCK_GIFS);
  
  const handleSearch = () => {
    // In a real app, this would call the GIF API with the search term
    // For this mock, we'll just shuffle the GIFs to simulate search
    setCurrentGifs([...MOCK_GIFS].sort(() => Math.random() - 0.5));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleSelectCategory = (category: string) => {
    setSearchTerm(category);
    // In a real app, this would call the GIF API with the category
    // For this mock, we'll just shuffle the GIFs to simulate category change
    setCurrentGifs([...MOCK_GIFS].sort(() => Math.random() - 0.5));
  };
  
  return (
    <div className="w-[320px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-medium">Select a GIF</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search GIFs..."
            className="flex-1"
          />
          <Button variant="ghost" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {TRENDING_CATEGORIES.map(category => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleSelectCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-2 h-[320px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {currentGifs.map((gif, index) => (
            <div 
              key={index}
              className="aspect-video bg-gray-100 dark:bg-gray-800 rounded cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
              onClick={() => onSelect(gif)}
            >
              <img 
                src={gif} 
                alt={`GIF ${index}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
