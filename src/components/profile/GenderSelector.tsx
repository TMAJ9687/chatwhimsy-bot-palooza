
import React from 'react';

interface GenderSelectorProps {
  gender: string;
  setGender: (gender: string) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ gender, setGender }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Gender</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setGender('male')}
          className={`
            p-3 rounded-lg text-center transition-all duration-300
            ${gender === 'male' 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'bg-card border border-border hover:border-blue-500/50'}
          `}
        >
          Male
        </button>
        <button
          type="button"
          onClick={() => setGender('female')}
          className={`
            p-3 rounded-lg text-center transition-all duration-300
            ${gender === 'female' 
              ? 'bg-pink-500 text-white shadow-sm' 
              : 'bg-card border border-border hover:border-pink-500/50'}
          `}
        >
          Female
        </button>
      </div>
    </div>
  );
};

export default GenderSelector;
