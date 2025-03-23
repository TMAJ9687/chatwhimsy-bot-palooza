
import React, { memo } from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start">
      <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm inline-flex space-x-1">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
      </div>
    </div>
  );
};

export default memo(TypingIndicator);
