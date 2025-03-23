
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'image' | 'text';
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'image'
}) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };
  
  if (variant === 'text') {
    return (
      <div className={`font-semibold text-2xl ${className}`}>
        <span className="text-primary">chat</span>
        <span className="text-secondary">wii</span>
        <span className="text-accent">.</span>
      </div>
    );
  }
  
  return (
    <img 
      src="/lovable-uploads/0d758ce3-525d-4cab-b5ff-da29d0055980.png" 
      alt="chatwii logo" 
      className={`${sizes[size]} ${className}`}
    />
  );
};

export default Logo;
