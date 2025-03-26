
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, RotateCw } from 'lucide-react';

interface TranslateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
}

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
  { code: 'hi', name: 'Hindi' }
];

const TranslateDialog: React.FC<TranslateDialogProps> = ({
  isOpen,
  onClose,
  originalText
}) => {
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Auto-translate when dialog opens
  useEffect(() => {
    if (isOpen && originalText) {
      handleTranslate();
    } else {
      setTranslatedText('');
    }
  }, [isOpen, originalText, targetLanguage]);
  
  const handleTranslate = () => {
    setIsTranslating(true);
    
    // Simulate translation - in a real implementation, this would call a translation API
    setTimeout(() => {
      // This is a mock translation - in a real app, you would use a translation service
      const mockTranslations: Record<string, string> = {
        'es': 'Este es un texto traducido al español.',
        'fr': 'Ceci est un texte traduit en français.',
        'de': 'Dies ist ein ins Deutsche übersetzter Text.',
        'it': 'Questo è un testo tradotto in italiano.',
        'pt': 'Este é um texto traduzido para o português.',
        'ru': 'Это текст, переведенный на русский язык.',
        'zh': '这是翻译成中文的文本。',
        'ja': 'これは日本語に翻訳されたテキストです。',
        'ko': '이것은 한국어로 번역된 텍스트입니다.',
        'ar': 'هذا نص مترجم إلى اللغة العربية.',
        'hi': 'यह हिंदी में अनुवादित पाठ है।'
      };
      
      setTranslatedText(mockTranslations[targetLanguage] || originalText);
      setIsTranslating(false);
    }, 1000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Translate Message</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Original text:</div>
            <div>{originalText}</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
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
              className="flex items-center gap-1"
            >
              {isTranslating && <RotateCw className="h-4 w-4 animate-spin" />}
              Translate
            </Button>
          </div>
          
          {translatedText && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-md">
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                Translated to {LANGUAGES.find(l => l.code === targetLanguage)?.name}:
              </div>
              <div>{translatedText}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranslateDialog;
