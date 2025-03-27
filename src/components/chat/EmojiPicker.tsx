
import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  emojis?: string[];
}

// Extended emoji list with more variety
const DEFAULT_EMOJIS = [
  // Smileys & Emotion
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌",
  "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸",
  "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤",
  
  // Gestures & People
  "👋", "🤚", "✋", "🖐️", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇",
  "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪", "❤️", "🧡", "💛",
  
  // Animals & Nature
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🌹",
  
  // Food & Drink
  "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥",
  
  // Activities
  "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🎮", "🎲", "🧩", "🎭",
  
  // Travel & Places
  "🚗", "✈️", "🚀", "🏠", "🌃", "🌄", "🌅", "🌇", "🗿", "🏰", "🏯", "🏟️", "🏙️", "🏝️", "🏜️", "🌋",
  
  // Objects
  "💻", "📱", "📷", "🎥", "💡", "🔍", "🧸", "🎁", "🎈", "🎊", "🎉", "🧨", "✉️", "📫", "📦", "📅"
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect,
  emojis = DEFAULT_EMOJIS
}) => {
  return (
    <div className="flex flex-wrap gap-2 max-w-[300px] max-h-[300px] overflow-y-auto p-2">
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
