
import React from 'react';

interface CountryFlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * CountryFlag component displays a country flag based on country code
 * Uses the flagcdn.com service which provides high-quality flag images
 */
const CountryFlag: React.FC<CountryFlagProps> = ({ 
  countryCode, 
  size = 'md',
  className = ''
}) => {
  // Map size to width
  const sizeMap = {
    sm: 'w-4',  // 16px
    md: 'w-6',  // 24px
    lg: 'w-8'   // 32px
  };
  
  // Get width class
  const widthClass = sizeMap[size];
  
  // Format country code (ensure lowercase)
  const formattedCode = countryCode.toLowerCase();
  
  // Flagcdn URL (w20 is the width in pixels, we'll scale with CSS)
  const flagUrl = `https://flagcdn.com/w20/${formattedCode}.png`;
  
  return (
    <img 
      src={flagUrl}
      alt={`${countryCode} flag`}
      className={`h-auto object-contain ${widthClass} ${className}`} 
      loading="lazy"
      onError={(e) => {
        // Fallback to text if flag doesn't load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
};

export default CountryFlag;
