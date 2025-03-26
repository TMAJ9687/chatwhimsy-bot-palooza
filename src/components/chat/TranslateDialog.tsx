
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TranslateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
}

// Mock translation languages
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
];

// Mock translation function (in a real app, this would call an API)
const translateText = async (text: string, targetLang: string): Promise<string> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 700));
  
  // For demo purposes, we'll add a prefix to show it's "translated"
  const translations: Record<string, string> = {
    'es': '¡Hola! ' + text,
    'fr': 'Bonjour! ' + text,
    'de': 'Hallo! ' + text,
    'it': 'Ciao! ' + text,
    'pt': 'Olá! ' + text,
    'ru': 'Привет! ' + text,
    'zh': '你好！' + text,
    'ja': 'こんにちは！' + text,
    'ko': '안녕하세요! ' + text,
    'ar': 'مرحبا! ' + text,
    'en': text, // No change for English
  };
  
  return translations[targetLang] || `[${targetLang}] ${text}`;
};

const TranslateDialog: React.FC<TranslateDialogProps> = ({
  isOpen,
  onClose,
  originalText,
}) => {
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Reset state when dialog opens or original text changes
  useEffect(() => {
    if (isOpen && originalText) {
      handleTranslate();
    }
  }, [isOpen, originalText, targetLanguage]);
  
  const handleTranslate = async () => {
    if (!originalText) return;
    
    setIsTranslating(true);
    try {
      const result = await translateText(originalText, targetLanguage);
      setTranslatedText(result);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Error translating text. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Translate Message</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Original text:</div>
            <p className="text-sm">{originalText}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select 
                value={targetLanguage} 
                onValueChange={setTargetLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Translate
            </Button>
          </div>
          
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md min-h-20">
            <div className="text-xs text-gray-500 mb-1">Translation ({languages.find(l => l.code === targetLanguage)?.name}):</div>
            {isTranslating ? (
              <div className="flex items-center justify-center h-16">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <p className="text-sm">{translatedText}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranslateDialog;
