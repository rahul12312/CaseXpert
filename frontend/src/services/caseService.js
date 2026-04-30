// ============================================================================
// Case Service - API calls for case management
// ============================================================================

import api from '../lib/api';

const caseService = {
  /**
   * Create a new case
   */
  createCase: async (caseData) => {
    const response = await api.post('/case/create', caseData);
    return response.data;
  },

  /**
   * Get list of cases
   */
  getCaseList: async () => {
    const response = await api.get('/case/list');
    return response.data;
  },

  /**
   * Get case details
   */
  getCaseDetails: async (caseId) => {
    const response = await api.get(`/case/details/${caseId}`);
    return response.data;
  },

  /**
   * Update case
   */
  updateCase: async (caseId, updates) => {
    const response = await api.put(`/case/update/${caseId}`, updates);
    return response.data;
  },

  /**
   * Update case status
   */
  updateStatus: async (caseId, status) => {
    const response = await api.put(`/case/status/${caseId}`, { status });
    return response.data;
  },

  /**
   * Add case update
   */
  addUpdate: async (updateData) => {
    const response = await api.post('/case/add-update', updateData);
    return response.data;
  },

  /**
   * Upload document
   */
  uploadDocument: async (caseId, file, onProgress) => {
    const formData = new FormData();
    formData.append('case_id', caseId);
    formData.append('file', file);

    const response = await api.post('/case/upload-document', formData, {
      onUploadProgress: onProgress,
    });
    return response.data;
  },

  /**
   * Add timeline event
   */
  addTimelineEvent: async (eventData) => {
    const response = await api.post('/case/add-timeline', eventData);
    return response.data;
  },

  /**
   * Get case activities
   */
  getActivities: async (caseId) => {
    const response = await api.get(`/case/activities/${caseId}`);
    return response.data;
  },

  /**
   * Delete case
   */
  deleteCase: async (caseId) => {
    const response = await api.delete(`/case/delete/${caseId}`);
    return response.data;
  },
};

export default caseService;
