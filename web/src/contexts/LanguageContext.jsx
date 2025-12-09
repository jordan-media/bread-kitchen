// LanguageContext.jsx - Global language state management
import { createContext, useState, useContext, useEffect } from 'react';

// Supported languages
export const LANGUAGES = {
    ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
    en: { code: 'en', name: 'English', flag: '🇨🇦' },
    ko: { code: 'ko', name: '한국어', flag: '🇰🇷' }
};

// Default language
const DEFAULT_LANGUAGE = 'ja';

// Create context
const LanguageContext = createContext();

// Detect browser language
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // Get 'en' from 'en-US'

    // Check if we support this language
    if (LANGUAGES[langCode]) {
        return langCode;
    }

    return DEFAULT_LANGUAGE;
}

// Provider component
export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem('language');
        if (saved && LANGUAGES[saved]) {
            return saved;
        }
        // Otherwise detect from browser
        return detectBrowserLanguage();
    });

    // Save language preference to localStorage
    useEffect(() => {
        localStorage.setItem('language', language);
        // Also set html lang attribute for accessibility
        document.documentElement.lang = language;
    }, [language]);

    const value = {
        language,
        setLanguage,
        languages: LANGUAGES,
        isJapanese: language === 'ja',
        isEnglish: language === 'en',
        isKorean: language === 'ko'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

// Custom hook to use language context
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
