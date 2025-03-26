
import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  emojis?: string[];
}

// Extended emoji list with common Apple device emojis
const DEFAULT_EMOJIS = [
  "😊", "😂", "❤️", "👍", "😍", "🙏", "😘", "🥰", "😎", "🔥", 
  "😁", "👋", "🤗", "🤔", "👀", "🙄", "😅", "😭", "😳", "😢",
  "🥺", "😩", "😫", "😤", "🤩", "🥳", "😏", "😒", "🙂", "😆",
  "👏", "🤝", "🙌", "💪", "✌️", "🤞", "🤟", "🤘", "👌", "🤌",
  "🖐️", "👎", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝",
  "🤣", "😇", "🥲", "😉", "😌", "😜", "😚", "😋", "😛", "😝",
  "😴", "😪", "🤤", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
  "🥶", "😵", "🤯", "🤠", "🥸", "😈", "👿", "👻", "💀", "☠️"
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect,
  emojis = DEFAULT_EMOJIS
}) => {
  return (
    <div className="w-[300px] max-h-[200px] overflow-y-auto p-2">
      <div className="flex flex-wrap gap-2">
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
    </div>
  );
};

export default EmojiPicker;
