import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import { translations, TranslationKey } from '../i18n/translations';

type Language = 'ar';

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const language: Language = 'ar';
  const isRTL = true;

  useEffect(() => {
    // Always force RTL for Arabic
    I18nManager.forceRTL(true);
  }, []);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

