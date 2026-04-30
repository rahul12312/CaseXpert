/**
 * Language Detection Middleware
 * Detects user's preferred language from JWT token or Accept-Language header
 * Attaches translator function to request object
 */

const jwt = require('jsonwebtoken');
const { createTranslator, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } = require('../i18n/translator');

/**
 * Extract language from JWT token
 */
function getLanguageFromToken(req) {
    try {
        const authHeader = req.header('Authorization') || req.header('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);

        if (!token) {
            return null;
        }

        // Decode without verification (just to get language preference)
        // The auth middleware will verify the token separately
        const decoded = jwt.decode(token);

        if (decoded && decoded.preferred_language) {
            return decoded.preferred_language;
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Extract language from Accept-Language header
 * Parses Accept-Language header and returns best match
 */
function getLanguageFromHeader(req) {
    try {
        const acceptLanguage = req.header('Accept-Language');

        if (!acceptLanguage) {
            return null;
        }

        // Parse Accept-Language header
        // Format: "en-US,en;q=0.9,hi;q=0.8"
        const languages = acceptLanguage
            .split(',')
            .map(lang => {
                const parts = lang.trim().split(';');
                const code = parts[0].split('-')[0]; // Get primary language (e.g., 'en' from 'en-US')
                const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
                return { code, quality };
            })
            .sort((a, b) => b.quality - a.quality); // Sort by quality (preference)

        // Find first supported language
        for (const lang of languages) {
            if (SUPPORTED_LANGUAGES.includes(lang.code)) {
                return lang.code;
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Extract language from query parameter
 */
function getLanguageFromQuery(req) {
    const lang = req.query.lang || req.query.language;

    if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
        return lang;
    }

    return null;
}

/**
 * Language Detection Middleware
 * Priority:
 * 1. Query parameter (?lang=hi)
 * 2. JWT token (preferred_language)
 * 3. Accept-Language header
 * 4. Default language (en)
 */
function languageDetector(req, res, next) {
    let language = DEFAULT_LANGUAGE;

    // Check query parameter first (explicit override)
    const queryLang = getLanguageFromQuery(req);
    if (queryLang) {
        language = queryLang;
    } else {
        // Check JWT token
        const tokenLang = getLanguageFromToken(req);
        if (tokenLang) {
            language = tokenLang;
        } else {
            // Check Accept-Language header
            const headerLang = getLanguageFromHeader(req);
            if (headerLang) {
                language = headerLang;
            }
        }
    }

    // Attach language and translator to request
    req.language = language;
    req.t = createTranslator(language);

    // Log language detection (optional, remove in production)
    if (process.env.NODE_ENV === 'development') {
        console.log(`🌐 Language detected: ${language} for ${req.method} ${req.path}`);
    }

    next();
}

/**
 * Middleware to set response language header
 */
function setLanguageHeader(req, res, next) {
    res.setHeader('Content-Language', req.language || DEFAULT_LANGUAGE);
    next();
}

/**
 * Helper function to send localized response
 * Usage: res.localizedJson(200, 'auth.login_success', { user })
 */
function attachLocalizedResponse(req, res, next) {
    // Add localizedJson method to response object
    res.localizedJson = function (statusCode, messageKey, data = {}, params = {}) {
        const message = req.t(messageKey, params);

        return this.status(statusCode).json({
            success: statusCode >= 200 && statusCode < 300,
            message,
            ...data
        });
    };

    // Add localizedError method
    res.localizedError = function (statusCode, errorKey, params = {}) {
        const message = req.t(errorKey, params);

        return this.status(statusCode).json({
            success: false,
            error: message,
            message
        });
    };

    next();
}

/**
 * Combined middleware for language detection and response helpers
 */
function languageMiddleware(req, res, next) {
    languageDetector(req, res, () => {
        setLanguageHeader(req, res, () => {
            attachLocalizedResponse(req, res, next);
        });
    });
}

module.exports = {
    languageDetector,
    setLanguageHeader,
    attachLocalizedResponse,
    languageMiddleware,
    getLanguageFromToken,
    getLanguageFromHeader,
    getLanguageFromQuery
};
