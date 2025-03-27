
import React from 'react';

/**
 * Renders content with emoji characters displayed larger than normal text
 * @param content The text content that may contain emojis
 * @returns A React element with emojis rendered in larger size
 */
export const renderContentWithEmojis = (content: string): React.ReactNode => {
  // Simple regex to detect emoji characters
  const emojiRegex = /(\p{Emoji})/gu;
  
  if (!content.match(emojiRegex)) {
    return <div className="whitespace-pre-wrap break-words text-sm">{content}</div>;
  }
  
  // Split content by emoji and non-emoji parts
  const parts = content.split(emojiRegex);
  
  return (
    <div className="whitespace-pre-wrap break-words text-sm">
      {parts.map((part, index) => {
        // If this part matches an emoji, render it with larger font
        if (part.match(emojiRegex)) {
          return <span key={index} className="text-xl inline-block">{part}</span>;
        }
        return part;
      })}
    </div>
  );
};
