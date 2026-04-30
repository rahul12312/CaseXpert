/**
 * Helper functions for frontend-only document persistence using localStorage
 */

const STORAGE_KEY = 'case_documents';

/**
 * Get all documents from localStorage
 * @returns {Array} Array of document objects
 */
export const getAllDocuments = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error fetching documents from localStorage:', error);
        return [];
    }
};

/**
 * Get documents filtered by caseId
 * @param {string|number} caseId The ID of the case
 * @returns {Array} Filtered documents
 */
export const getDocumentsByCaseId = (caseId) => {
    const allDocs = getAllDocuments();
    return allDocs.filter(doc => String(doc.relatedCaseId) === String(caseId));
};

/**
 * Save a new document to localStorage
 * @param {Object} documentData Metadata and Base64 data
 */
export const saveDocumentToLocalStorage = (documentData) => {
    try {
        const allDocs = getAllDocuments();
        const updatedDocs = [...allDocs, documentData];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
        return true;
    } catch (error) {
        console.error('Error saving document to localStorage:', error);
        // localStorage might be full
        if (error.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Please delete some old documents to upload new ones.');
        }
        return false;
    }
};

/**
 * Delete a document from localStorage by ID
 * @param {string|number} documentId 
 */
export const deleteDocumentFromLocalStorage = (documentId) => {
    try {
        const allDocs = getAllDocuments();
        const updatedDocs = allDocs.filter(doc => doc.documentId !== documentId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
        return true;
    } catch (error) {
        console.error('Error deleting document from localStorage:', error);
        return false;
    }
};

/**
 * Update an existing document's metadata in localStorage
 * @param {string|number} documentId 
 * @param {Object} updates key-value pairs to update
 */
export const updateDocumentInLocalStorage = (documentId, updates) => {
    try {
        const allDocs = getAllDocuments();
        const updatedDocs = allDocs.map(doc => 
            doc.documentId === documentId ? { ...doc, ...updates } : doc
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
        return true;
    } catch (error) {
        console.error('Error updating document in localStorage:', error);
        return false;
    }
};

/**
 * Convert a File object to Base64 string

 * @param {File} file 
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};
