
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Languages } from 'lucide-react';
import { Message } from '@/types/chat';

interface TranslateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  userName: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

const TranslateDialog: React.FC<TranslateDialogProps> = ({
  isOpen,
  onClose,
  messages,
  userName,
}) => {
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Only show text messages (not system, images, or voice)
  const textMessages = messages.filter(
    (message) => !message.isImage && !message.isVoice && message.sender !== 'system'
  );

  const handleTranslate = () => {
    // Simulate translation
    setIsTranslating(true);
    
    // In a real app, you would call a translation API here
    setTimeout(() => {
      const translations: Record<string, string> = {};
      
      textMessages.forEach((message) => {
        // Mock translation by adding language code as prefix
        translations[message.id] = `[${targetLanguage}] ${message.content}`;
      });
      
      setTranslatedMessages(translations);
      setIsTranslating(false);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Translate Conversation with {userName}</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">Target Language:</div>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-h-[300px] overflow-y-auto border rounded-md">
            {textMessages.length > 0 ? (
              <div className="space-y-4 p-4">
                {textMessages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className={`text-sm font-medium ${message.sender === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                      {message.sender === 'user' ? 'You' : userName}:
                    </div>
                    <div className="text-sm">{message.content}</div>
                    {translatedMessages[message.id] && (
                      <div className="text-sm italic text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                        {translatedMessages[message.id]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No text messages in this conversation
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || textMessages.length === 0}
            className="w-full"
          >
            {isTranslating ? 'Translating...' : (
              <>
                <Languages className="h-4 w-4 mr-2" />
                Translate Messages
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranslateDialog;
