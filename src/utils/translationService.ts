
/**
 * Translation Service
 * Provides utilities for translating text in real-time
 */

// List of supported languages with their codes
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
];

// Translation API interface
export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: {
    language: string;
    confidence: number;
  };
}

/**
 * Translate text to the specified language
 * For demonstration purposes, this uses a mock implementation
 * In a real app, you would integrate with a translation API
 */
export const translateText = async (
  text: string,
  targetLang: string = 'en'
): Promise<TranslationResult> => {
  // In a real app, you would call an actual translation API
  // For demo purposes, we'll simulate a translation with a delay
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // For demonstration, we'll just use a mock translation
      const mockTranslations: Record<string, string> = {
        'Hello, how are you?': '¡Hola! ¿Cómo estás?',
        'I am good, thank you.': 'Estoy bien, gracias.',
        'What are you doing today?': '¿Qué estás haciendo hoy?',
        'The weather is nice.': 'El clima está agradable.',
        'I like this chat app.': 'Me gusta esta aplicación de chat.',
      };

      // Return mock translation or the original text with a language tag
      const result: TranslationResult = {
        translatedText: mockTranslations[text] || `[${targetLang}] ${text}`,
        detectedLanguage: {
          language: 'en', // Assuming source is English
          confidence: 0.9
        }
      };

      resolve(result);
    }, 700); // Simulate network delay
  });
};

/**
 * Detect the language of the provided text
 * For demonstration purposes, this uses a mock implementation
 */
export const detectLanguage = async (text: string): Promise<string> => {
  // In a real app, you would call a language detection API
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // For demo purposes, return English for most texts
      resolve('en');
    }, 300);
  });
};

/**
 * Get language name from language code
 */
export const getLanguageName = (langCode: string): string => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
  return language ? language.name : langCode;
};
