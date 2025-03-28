
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InterestsSelectorProps {
  interests: string[];
  setInterests: (interests: string[]) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const InterestsSelector: React.FC<InterestsSelectorProps> = ({ 
  interests, 
  setInterests, 
  isOpen, 
  setIsOpen 
}) => {
  const popularInterests = [
    'Music', 'Movies', 'Travel', 'Sports', 'Gaming',
    'Photography', 'Cooking', 'Art', 'Reading', 'Technology',
    'Fashion', 'Fitness', 'Nature', 'Science', 'Animals'
  ];

  const handleInterestClick = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      if (interests.length < 2) {
        setInterests([...interests, interest]);
      }
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-border rounded-lg p-3 mt-3"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
        <span>Interests (optional)</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {popularInterests.map((interest) => (
            <button
              key={interest}
              onClick={() => handleInterestClick(interest)}
              className={`
                text-sm px-3 py-1.5 rounded-full transition-all duration-300
                ${interests.includes(interest)
                  ? 'bg-primary/90 text-white'
                  : 'bg-card border border-border hover:border-primary/50'}
                ${interests.length >= 2 && !interests.includes(interest) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={interests.length >= 2 && !interests.includes(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
        {interests.length === 2 && (
          <p className="text-xs text-muted-foreground">
            Standard users can select up to 2 interests. Upgrade to VIP for more!
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InterestsSelector;
