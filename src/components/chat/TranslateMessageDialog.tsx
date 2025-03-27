
import React, { useState, useCallback, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const LANGUAGES = [
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
  { code: 'tr', name: 'Turkish' },
];

interface TranslateMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslate: (language: string) => void;
}

// Memoized dialog content for better performance
const DialogContentComponent = memo(({
  targetLanguage,
  setTargetLanguage,
  onClose,
  onTranslate,
}: {
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  onClose: () => void;
  onTranslate: () => void;
}) => (
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle>Translate Message</DialogTitle>
      <DialogDescription>
        Select a language to translate this message to.
      </DialogDescription>
    </DialogHeader>

    <div className="py-4">
      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={onTranslate}>
        Translate
      </Button>
    </DialogFooter>
  </DialogContent>
));

DialogContentComponent.displayName = 'TranslateDialogContent';

const TranslateMessageDialog: React.FC<TranslateMessageDialogProps> = ({
  isOpen,
  onClose,
  onTranslate,
}) => {
  const [targetLanguage, setTargetLanguage] = useState('en');
  const { toast } = useToast();

  // Use performance markers to track translation operations
  const markTranslationOperation = useCallback(() => {
    performance.mark('translation_start');
    
    const languageName = LANGUAGES.find(l => l.code === targetLanguage)?.name;
    
    // Use requestAnimationFrame to prevent UI freeze
    requestAnimationFrame(() => {
      onTranslate(targetLanguage);
      
      toast({
        title: 'Translation requested',
        description: `Message will be translated to ${languageName}.`,
      });
      
      onClose();
      
      performance.mark('translation_end');
      performance.measure('Translation Operation', 'translation_start', 'translation_end');
    });
  }, [targetLanguage, onTranslate, toast, onClose]);

  // Optimized close handler
  const handleClose = useCallback(() => {
    requestAnimationFrame(() => {
      onClose();
    });
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContentComponent
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        onClose={handleClose}
        onTranslate={markTranslationOperation}
      />
    </Dialog>
  );
};

export default memo(TranslateMessageDialog);
