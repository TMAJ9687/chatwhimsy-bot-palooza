
import React from 'react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="text-center max-w-md p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="text-xl font-semibold mb-2">No Active Chat</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Select a user from the list to start a conversation.
        </p>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-400 dark:text-gray-500 text-center">
          Google AdSense Placeholder
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
