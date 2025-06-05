
import React, { useState, ReactNode } from 'react';
import { Language, TranslationContextType, TranslationContext } from '@/hooks/useTranslation';
import { translations } from '@/translations/translations';

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
