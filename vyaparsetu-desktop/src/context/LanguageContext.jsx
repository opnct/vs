import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to English
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('vs_app_language');
    return saved || 'en';
  });

  // Persist language change to localStorage
  useEffect(() => {
    localStorage.setItem('vs_app_language', language);
  }, [language]);

  /**
   * Translation function
   * @param {string} key - The translation key defined in translations.js
   * @returns {string} - The translated text in current language or fallback to English
   */
  const t = (key) => {
    if (!translations[key]) {
      console.warn(`Translation key missing: ${key}`);
      return key;
    }
    return translations[key][language] || translations[key]['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for consuming language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};