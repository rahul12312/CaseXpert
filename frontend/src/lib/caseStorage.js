/**
 * Helper functions for frontend-only case data persistence using localStorage
 */

const STORAGE_KEY = 'cases_data';

/**
 * Save cases to localStorage
 * @param {Array} cases - Array of case objects
 */
export const saveCasesToStorage = (cases) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    } catch (error) {
        console.error('Error saving cases to localStorage:', error);
    }
};

/**
 * Get cases from localStorage
 * @returns {Array} - Array of saved cases
 */
export const getCasesFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error fetching cases from localStorage:', error);
        return [];
    }
};

/**
 * Seed sample cases to localStorage if empty
 * @param {Array} sampleData - Array of 20 sample cases from user request
 */
export const seedLocalStorageIfEmpty = (sampleData) => {
    const existing = getCasesFromStorage();
    if (existing.length === 0) {
        console.log('Seeding localStorage with sample cases...');
        saveCasesToStorage(sampleData);
        return true;
    }
    return false;
};
