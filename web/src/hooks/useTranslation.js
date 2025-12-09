// useTranslation.js - Custom hook for accessing translations
import { useLanguage } from '../contexts/LanguageContext';

// Import all translation files
// English (base language)
import enCommon from '../locales/en/common.json';
import enHome from '../locales/en/home.json';
import enProducts from '../locales/en/products.json';
import enCourses from '../locales/en/courses.json';
import enAbout from '../locales/en/about.json';
import enContact from '../locales/en/contact.json';

// Japanese
import jaCommon from '../locales/ja/common.json';
import jaHome from '../locales/ja/home.json';
import jaProducts from '../locales/ja/products.json';
import jaCourses from '../locales/ja/courses.json';
import jaAbout from '../locales/ja/about.json';
import jaContact from '../locales/ja/contact.json';

// Korean
import koCommon from '../locales/ko/common.json';
import koHome from '../locales/ko/home.json';
import koProducts from '../locales/ko/products.json';
import koCourses from '../locales/ko/courses.json';
import koAbout from '../locales/ko/about.json';
import koContact from '../locales/ko/contact.json';

// Organize translations by language
const translations = {
    en: {
        common: enCommon,
        home: enHome,
        products: enProducts,
        courses: enCourses,
        about: enAbout,
        contact: enContact
    },
    ja: {
        common: jaCommon,
        home: jaHome,
        products: jaProducts,
        courses: jaCourses,
        about: jaAbout,
        contact: jaContact
    },
    ko: {
        common: koCommon,
        home: koHome,
        products: koProducts,
        courses: koCourses,
        about: koAbout,
        contact: koContact
    }
};

// Default fallback language
const FALLBACK_LANGUAGE = 'ja';

/**
 * Custom hook for translations
 * @param {string} namespace - The translation namespace (e.g., 'common', 'home', 'products')
 * @returns {object} - { t: translation function, language: current language }
 */
export function useTranslation(namespace = 'common') {
    const { language } = useLanguage();

    /**
     * Get translation for a key
     * @param {string} key - The translation key (e.g., 'nav.menu' or 'subscribe.button')
     * @param {object} params - Optional parameters for interpolation
     * @returns {string} - The translated string
     */
    const t = (key, params = {}) => {
        // Try current language first
        let value = getNestedValue(translations[language]?.[namespace], key);

        // Fallback to Japanese if not found
        if (value === undefined && language !== FALLBACK_LANGUAGE) {
            value = getNestedValue(translations[FALLBACK_LANGUAGE]?.[namespace], key);
        }

        // Fallback to English if still not found
        if (value === undefined && language !== 'en') {
            value = getNestedValue(translations['en']?.[namespace], key);
        }

        // If still not found, return the key itself (helps identify missing translations)
        if (value === undefined) {
            console.warn(`Missing translation: ${namespace}.${key}`);
            return key;
        }

        // Handle parameter interpolation (e.g., "Hello {{name}}" with {name: "John"})
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match;
            });
        }

        return value;
    };

    return { t, language };
}

/**
 * Helper to get nested object values using dot notation
 * e.g., getNestedValue(obj, 'nav.menu') returns obj.nav.menu
 */
function getNestedValue(obj, key) {
    if (!obj || !key) return undefined;

    const keys = key.split('.');
    let value = obj;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return undefined;
        }
    }

    return value;
}

export default useTranslation;
