
import React, { useState } from 'react';
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

const TranslateMessageDialog: React.FC<TranslateMessageDialogProps> = ({
  isOpen,
  onClose,
  onTranslate,
}) => {
  const [targetLanguage, setTargetLanguage] = useState('en');
  const { toast } = useToast();

  const handleTranslate = () => {
    onTranslate(targetLanguage);
    toast({
      title: 'Translation requested',
      description: `Message will be translated to ${LANGUAGES.find(l => l.code === targetLanguage)?.name}.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
          <Button onClick={handleTranslate}>
            Translate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranslateMessageDialog;
