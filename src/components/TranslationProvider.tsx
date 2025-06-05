
import React, { createContext, useState, ReactNode } from 'react';
import { Language, TranslationContextType } from '@/hooks/useTranslation';
import { translations } from '@/translations/translations';

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

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
