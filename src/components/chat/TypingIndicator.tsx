
import React from 'react';

interface TypingIndicatorProps {
  username?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username = 'User' }) => {
  return (
    <div className="flex items-start space-x-2 mb-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
        {username.charAt(0).toUpperCase()}
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-2xl max-w-xs">
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
          <div className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
