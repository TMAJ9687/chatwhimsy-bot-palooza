
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`font-semibold ${sizes[size]} ${className}`}>
      <span className="text-primary">chat</span>
      <span className="text-secondary">wii</span>
      <span className="text-accent">.</span>
    </div>
  );
};

export default Logo;
