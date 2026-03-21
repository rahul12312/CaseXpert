import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getAvailableLanguages, getCurrentLanguage } from '../i18n/config';
import { Globe } from 'lucide-react';

/**
 * LanguageSwitcher Component
 * Professional language selector with dropdown
 * Stores preference in localStorage and updates JWT via API
 */
const LanguageSwitcher = ({ className = '', showLabel = true }) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
    const dropdownRef = useRef(null);

    const languages = getAvailableLanguages();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update when language changes externally
    useEffect(() => {
        const handleLanguageChange = () => {
            setCurrentLang(getCurrentLanguage());
        };

        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    const handleLanguageChange = async (languageCode) => {
        try {
            // Change language in i18next
            await changeLanguage(languageCode);
            setCurrentLang(languageCode);
            setIsOpen(false);

            // Update user preference in backend if user is logged in
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/update-language`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ preferred_language: languageCode })
                    });

                    if (response.ok) {
                        console.log('✅ Language preference saved to backend');
                    }
                } catch (error) {
                    console.error('Failed to save language preference:', error);
                    // Don't show error to user - language still works locally
                }
            }

            // Show success toast (if you have toast system)
            if (window.toast) {
                window.toast.success(t('common.message.updated'));
            }
        } catch (error) {
            console.error('Language change error:', error);
        }
    };

    const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Language Selector Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Select language"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="text-xl" aria-hidden="true">{currentLanguage.flag}</span>
                {showLabel && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
                        {currentLanguage.nativeName}
                    </span>
                )}
                <svg
                    className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('common.label.language')}
                        </p>
                    </div>

                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => handleLanguageChange(language.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 ${currentLang === language.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                            role="menuitem"
                        >
                            <span className="text-2xl" aria-hidden="true">{language.flag}</span>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {language.nativeName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {language.name}
                                </p>
                            </div>
                            {currentLang === language.code && (
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;

/**
 * Compact Language Switcher for Mobile
 */
export const CompactLanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
    const languages = getAvailableLanguages();

    const handleLanguageChange = async (e) => {
        const languageCode = e.target.value;
        await changeLanguage(languageCode);
        setCurrentLang(languageCode);

        // Update backend
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/update-language`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ preferred_language: languageCode })
                });
            } catch (error) {
                console.error('Failed to save language preference:', error);
            }
        }
    };

    return (
        <select
            value={currentLang}
            onChange={handleLanguageChange}
            className="px-3 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select language"
        >
            {languages.map((language) => (
                <option key={language.code} value={language.code}>
                    {language.flag} {language.nativeName}
                </option>
            ))}
        </select>
    );
};
