import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <Languages className={`h-4 w-4 sm:h-5 sm:w-5${language === 'ar' ? ' ml-2' : ''}`} />
      <span className="hidden sm:inline font-medium text-sm">
        {language === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;