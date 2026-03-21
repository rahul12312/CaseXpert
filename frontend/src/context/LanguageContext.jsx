import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from '../data/translations';
import toast from 'react-hot-toast';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('casexpert_lang') || 'en';
    });

    const changeLanguage = (langCode) => {
        if (translations[langCode]) {
            setLanguage(langCode);
            localStorage.setItem('casexpert_lang', langCode);

            // Show success toast in the new language
            const successMsg = translations[langCode]?.common?.success || translations['en'].common.success;
            toast.success(successMsg);
        } else {
            toast.error(translations[language]?.common?.error || "Language not supported");
        }
    };

    const t = (path) => {
        const keys = path.split('.');
        let value = translations[language];

        for (const key of keys) {
            if (value && value[key]) {
                value = value[key];
            } else {
                // Fallback to English
                let fallbackValue = translations['en'];
                for (const fallbackKey of keys) {
                    if (fallbackValue && fallbackValue[fallbackKey]) {
                        fallbackValue = fallbackValue[fallbackKey];
                    } else {
                        return path; // Return path if not found even in fallback
                    }
                }
                return fallbackValue;
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, languages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
