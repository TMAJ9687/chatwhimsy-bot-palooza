
import React, { useState, useCallback, memo, useEffect } from 'react';
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
import { debounce } from '@/utils/performanceMonitor';

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
  <DialogContent className="sm:max-w-[400px] hardware-accelerated" aria-describedby="translate-dialog-description">
    <DialogHeader>
      <DialogTitle>Translate Message</DialogTitle>
      <DialogDescription id="translate-dialog-description">
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
            <SelectItem key={language.code} value={language.code} className="list-item">
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
      <Button onClick={onTranslate} className="bg-teal-500 hover:bg-teal-600">
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
  const [targetLanguage, setTargetLanguage] = useState('es'); // Default to Spanish for better UX
  const { toast } = useToast();

  // Use a ref to avoid recreating the handler on each render
  const requestRef = React.useRef<number | null>(null);

  // Reset dialog state when it opens
  useEffect(() => {
    if (isOpen) {
      setTargetLanguage('es'); // Default to Spanish for better UX
      
      // Performance monitoring
      performance.mark('translate_dialog_open');
      
      return () => {
        performance.mark('translate_dialog_close');
        performance.measure('Translation Dialog Session', 'translate_dialog_open', 'translate_dialog_close');
        
        // Clean up any pending animation frames
        if (requestRef.current !== null) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      };
    }
  }, [isOpen]);

  // Debounced toast operation to prevent UI freeze
  const debouncedToast = useCallback(
    debounce((title: string, description: string) => {
      toast({ title, description });
    }, 100),
    [toast]
  );

  // Optimized translation handler with requestAnimationFrame
  const handleTranslate = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
    
    performance.mark('translation_action_start');
    
    // Execute translation in the next animation frame
    requestRef.current = requestAnimationFrame(() => {
      requestRef.current = null;
      
      const languageName = LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage.toUpperCase();
      
      onTranslate(targetLanguage);
      
      debouncedToast(
        'Translation complete',
        `Message has been translated to ${languageName}.`
      );
      
      onClose();
      
      performance.mark('translation_action_end');
      performance.measure(
        'Translation Action',
        'translation_action_start',
        'translation_action_end'
      );
    });
  }, [targetLanguage, onTranslate, debouncedToast, onClose]);

  // Optimized close handler
  const handleClose = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
    
    requestRef.current = requestAnimationFrame(() => {
      requestRef.current = null;
      onClose();
    });
  }, [onClose]);

  // Don't render if not open to save resources
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContentComponent
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        onClose={handleClose}
        onTranslate={handleTranslate}
      />
    </Dialog>
  );
};

export default memo(TranslateMessageDialog);
