
import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslation, Language } from '@/hooks/useTranslation';

const LanguageSelector = () => {
  const { language, setLanguage } = useTranslation();

  const languages: { code: Language; flag: string; name: string }[] = [
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-gray-600" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1 text-sm ${
              language === lang.code 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.code.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
