/**
 * Backend Translation Utility
 * Provides localized messages for API responses
 */

const fs = require('fs');
const path = require('path');

// Cache for loaded translations
const translationsCache = {};

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr'];
const DEFAULT_LANGUAGE = 'en';

/**
 * Load translation file for a given language
 */
function loadTranslations(language) {
    if (translationsCache[language]) {
        return translationsCache[language];
    }

    try {
        const filePath = path.join(__dirname, 'locales', `${language}.json`);
        const data = fs.readFileSync(filePath, 'utf8');
        translationsCache[language] = JSON.parse(data);
        return translationsCache[language];
    } catch (error) {
        console.error(`Failed to load translations for language: ${language}`, error.message);
        // Return English as fallback
        if (language !== DEFAULT_LANGUAGE) {
            return loadTranslations(DEFAULT_LANGUAGE);
        }
        return {};
    }
}

/**
 * Get translated message
 * 
 * @param {string} key - Translation key in dot notation (e.g., 'auth.login_success')
 * @param {string} language - Language code
 * @param {object} params - Parameters for interpolation
 * @returns {string} Translated message
 * 
 * @example
 * translate('auth.login_success', 'hi') 
 * // Returns: "लॉगिन सफल"
 * 
 * translate('validation.required_field', 'en', { field: 'Email' })
 * // Returns: "Email is required"
 */
function translate(key, language = DEFAULT_LANGUAGE, params = {}) {
    // Validate language
    const lang = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

    // Load translations
    const translations = loadTranslations(lang);

    // Navigate through nested keys
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Key not found, try fallback language
            if (lang !== DEFAULT_LANGUAGE) {
                return translate(key, DEFAULT_LANGUAGE, params);
            }
            // If even fallback fails, return the key itself
            console.warn(`Translation key not found: ${key} for language: ${lang}`);
            return key;
        }
    }

    // If value is not a string, return key
    if (typeof value !== 'string') {
        return key;
    }

    // Interpolate parameters
    let result = value;
    for (const [param, paramValue] of Object.entries(params)) {
        const regex = new RegExp(`{{${param}}}`, 'g');
        result = result.replace(regex, paramValue);
    }

    return result;
}

/**
 * Create translator function for a specific language
 * 
 * @param {string} language - Language code
 * @returns {function} Translator function
 * 
 * @example
 * const t = createTranslator('hi');
 * t('auth.login_success') // Returns Hindi translation
 */
function createTranslator(language = DEFAULT_LANGUAGE) {
    return (key, params = {}) => translate(key, language, params);
}

/**
 * Get all translations for a language (for debugging)
 */
function getAllTranslations(language = DEFAULT_LANGUAGE) {
    return loadTranslations(language);
}

/**
 * Clear translation cache (useful for development/testing)
 */
function clearCache() {
    Object.keys(translationsCache).forEach(key => {
        delete translationsCache[key];
    });
}

/**
 * Reload translations (useful for hot-reloading in development)
 */
function reloadTranslations() {
    clearCache();
    // Preload all supported languages
    SUPPORTED_LANGUAGES.forEach(lang => {
        loadTranslations(lang);
    });
    console.log('✅ Translations reloaded');
}

// Preload default language on initialization
loadTranslations(DEFAULT_LANGUAGE);

module.exports = {
    translate,
    createTranslator,
    getAllTranslations,
    clearCache,
    reloadTranslations,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
};
