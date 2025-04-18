
import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  emojis?: string[];
  className?: string;
  useBasicPicker?: boolean;
}

const DEFAULT_EMOJIS = ["😊", "😂", "❤️", "👍", "😍", "🙏", "😘", "🥰", "😎", "🔥", "😁", "👋", "🤗", "🤔"];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect,
  emojis = DEFAULT_EMOJIS,
  className = "",
  useBasicPicker = false
}) => {
  // Handle emoji selection from emoji-mart
  const handleEmojiSelect = (emojiData: any) => {
    onEmojiSelect(emojiData.native);
  };

  if (useBasicPicker) {
    return (
      <div className={`flex flex-wrap gap-2 max-w-[200px] ${className}`}>
        {emojis.map(emoji => (
          <button
            key={emoji}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => onEmojiSelect(emoji)}
            type="button"
            aria-label={`Emoji ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  }
  
  return (
    <div className="emoji-mart-container">
      <Picker 
        data={data} 
        onEmojiSelect={handleEmojiSelect}
        set="native"
        theme="auto"
        autoFocus={true}
        skinTonePosition="search"
        previewPosition="bottom"
        navPosition="top"
        perLine={8}
        emojiSize={20}
        emojiButtonSize={30}
        maxFrequentRows={1}
      />
    </div>
  );
};

export default EmojiPicker;
