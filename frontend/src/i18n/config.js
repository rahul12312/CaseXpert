import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enLawyer from './locales/en/lawyer.json';
import enCases from './locales/en/cases.json';
import enValidation from './locales/en/validation.json';
import enErrors from './locales/en/errors.json';

import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiDashboard from './locales/hi/dashboard.json';
import hiLawyer from './locales/hi/lawyer.json';
import hiCases from './locales/hi/cases.json';
import hiValidation from './locales/hi/validation.json';
import hiErrors from './locales/hi/errors.json';

import mrCommon from './locales/mr/common.json';
import mrAuth from './locales/mr/auth.json';
import mrDashboard from './locales/mr/dashboard.json';
import mrLawyer from './locales/mr/lawyer.json';
import mrCases from './locales/mr/cases.json';
import mrValidation from './locales/mr/validation.json';
import mrErrors from './locales/mr/errors.json';

// Resources object
const resources = {
    en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        lawyer: enLawyer,
        cases: enCases,
        validation: enValidation,
        errors: enErrors
    },
    hi: {
        common: hiCommon,
        auth: hiAuth,
        dashboard: hiDashboard,
        lawyer: hiLawyer,
        cases: hiCases,
        validation: hiValidation,
        errors: hiErrors
    },
    mr: {
        common: mrCommon,
        auth: mrAuth,
        dashboard: mrDashboard,
        lawyer: mrLawyer,
        cases: mrCases,
        validation: mrValidation,
        errors: mrErrors
    }
};

// Language detection options
const detectionOptions = {
    // Order of language detection
    order: [
        'localStorage',        // 1. Check localStorage first (user's saved preference)
        'navigator',          // 2. Browser language
        'htmlTag',            // 3. html lang attribute
        'querystring',        // 4. ?lng=en query parameter
        'cookie',             // 5. Cookie
        'sessionStorage'      // 6. Session storage
    ],

    // Keys to lookup language from
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'preferredLanguage',
    lookupSessionStorage: 'preferredLanguage',

    // Cache user language preference
    caches: ['localStorage'],
    excludeCacheFor: ['cimode'],

    // Optional htmlTag detection
    htmlTag: document.documentElement,

    // Cookie options
    cookieMinutes: 10080, // 7 days
    cookieDomain: 'casexpert.com'
};

i18n
    // Load translation using http (in production, can use CDN)
    // .use(Backend)

    // Detect user language
    .use(LanguageDetector)

    // Pass i18n instance to react-i18next
    .use(initReactI18next)

    // Initialize i18next
    .init({
        resources,

        // Fallback language
        fallbackLng: 'en',

        // Default language
        lng: 'en',

        // Supported languages
        supportedLngs: ['en', 'hi', 'mr'],

        // Namespace configuration
        defaultNS: 'common',
        ns: ['common', 'auth', 'dashboard', 'lawyer', 'cases', 'validation', 'errors'],

        // Language detection
        detection: detectionOptions,

        // Debug mode (disable in production)
        debug: process.env.NODE_ENV === 'development',

        // Interpolation options
        interpolation: {
            escapeValue: false, // React already safes from xss
            formatSeparator: ',',
            format: (value, format, lng) => {
                // Custom formatters
                if (format === 'uppercase') return value.toUpperCase();
                if (format === 'lowercase') return value.toLowerCase();
                if (format === 'capitalize') {
                    return value.charAt(0).toUpperCase() + value.slice(1);
                }

                // Date formatting
                if (value instanceof Date) {
                    return new Intl.DateTimeFormat(lng).format(value);
                }

                return value;
            }
        },

        // React options
        react: {
            useSuspense: true,
            bindI18n: 'languageChanged loaded',
            bindI18nStore: 'added removed',
            transEmptyNodeValue: '',
            transSupportBasicHtmlNodes: true,
            transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span']
        },

        // Load options
        load: 'languageOnly', // Load 'en' instead of 'en-US'

        // Preload languages
        preload: ['en'],

        // Missing key handler
        saveMissing: true,
        missingKeyHandler: (lngs, ns, key, fallbackValue) => {
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Missing translation key: ${ns}:${key} for languages: ${lngs.join(', ')}`);
            }
        },

        // Parsing options
        parseMissingKeyHandler: (key) => {
            if (process.env.NODE_ENV === 'development') {
                return `[MISSING: ${key}]`;
            }
            return key;
        },

        // Backend options (for lazy loading)
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            addPath: '/locales/add/{{lng}}/{{ns}}',
            allowMultiLoading: false,
            crossDomain: false,
            withCredentials: false,
            overrideMimeType: false,
            requestOptions: {
                mode: 'cors',
                credentials: 'same-origin',
                cache: 'default'
            }
        },

        // Return objects for complex translations
        returnObjects: false,
        returnEmptyString: true,
        returnNull: false,

        // Join arrays
        joinArrays: false,

        // Key separator
        keySeparator: '.',
        nsSeparator: ':',

        // Plurals
        pluralSeparator: '_',
        contextSeparator: '_',

        // Append namespace to missing value
        appendNamespaceToMissingKey: false,
        appendNamespaceToCIMode: false,

        // Performance options
        updateMissing: false,
        saveMissingTo: 'current',

        // Post processing
        postProcess: false,

        // Max retries for loading
        maxRetries: 3,
        retryTimeout: 350
    });

// Export configured i18n instance
export default i18n;

// Helper function to change language
export const changeLanguage = async (lng) => {
    try {
        await i18n.changeLanguage(lng);

        // Store preference in localStorage
        localStorage.setItem('preferredLanguage', lng);

        // Update html lang attribute for SEO and accessibility
        document.documentElement.lang = lng;

        // Update dir attribute for RTL support (future)
        const rtlLanguages = ['ar', 'ur', 'he'];
        document.documentElement.dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';

        // Dispatch custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lng }
        }));

        return true;
    } catch (error) {
        console.error('Error changing language:', error);
        return false;
    }
};

// Get current language
export const getCurrentLanguage = () => {
    return i18n.language || 'en';
};

// Get all available languages
export const getAvailableLanguages = () => {
    return [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' }
    ];
};

// Check if RTL language
export const isRTL = (lng = i18n.language) => {
    const rtlLanguages = ['ar', 'ur', 'he'];
    return rtlLanguages.includes(lng);
};

// Reload translations (useful for dynamic updates)
export const reloadTranslations = async () => {
    try {
        await i18n.reloadResources();
        return true;
    } catch (error) {
        console.error('Error reloading translations:', error);
        return false;
    }
};
