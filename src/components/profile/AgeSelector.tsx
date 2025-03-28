
import React from 'react';

interface AgeSelectorProps {
  age: number;
  setAge: (age: number) => void;
  ageOptions: number[];
}

const AgeSelector: React.FC<AgeSelectorProps> = ({ age, setAge, ageOptions }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Age</label>
      <select
        value={age}
        onChange={(e) => setAge(parseInt(e.target.value))}
        className="w-full bg-card border border-border rounded-lg p-3 text-foreground"
      >
        {ageOptions.map((option) => (
          <option key={option} value={option}>
            {option} years
          </option>
        ))}
      </select>
    </div>
  );
};

export default AgeSelector;
