
import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  emojis?: string[];
}

const DEFAULT_EMOJIS = ["😊", "😂", "❤️", "👍", "😍", "🙏", "😘", "🥰", "😎", "🔥", "😁", "👋", "🤗", "🤔"];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect,
  emojis = DEFAULT_EMOJIS
}) => {
  return (
    <div className="flex flex-wrap gap-2 max-w-[200px]">
      {emojis.map(emoji => (
        <button
          key={emoji}
          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
