import api from '../lib/api';

const reportsService = {
  getOverview: async () => {
    const res = await api.get('/reports/dashboard-stats');
    return { data: res.data.data };
  },

  getCasesByStatus: async () => {
    const res = await api.get('/reports/cases');
    const byStatus = res.data.data.by_status || [];
    const formatted = {};
    byStatus.forEach(item => {
      const key = item.status.toLowerCase().replace(/ /g, '_');
      formatted[key] = item.count;
    });
    return { data: formatted };
  },

  getCaseHistory: async () => {
    const res = await api.get('/reports/cases-list');
    return { data: res.data.data };
  },

  getLawyerPerformance: async () => {
    const res = await api.get('/reports/advocates');
    const data = (res.data.data || []).map(item => ({
      lawyer_id: item.lawyer_id || item.advocate_name,
      lawyer_name: item.advocate_name,
      total_cases: item.total_cases,
      closed_cases: item.closed_cases,
      success_rate: item.total_cases ? Math.round((item.closed_cases / item.total_cases) * 100) : 0,
      rating: item.rating && item.rating > 0 ? item.rating : "N/A" // Use real rating or N/A
    }));
    return { data: data };
  },

  getUserActivity: async (userId) => {
    try {
      const res = await api.get('/reports/user-activity');
      return { data: res.data.data };
    } catch (e) {
      console.error("Failed to fetch user activity", e);
      return { data: [] };
    }
  },

  getTopLawyers: async () => {
    const res = await api.get('/reports/advocates');
    // Sort by success rate or total cases logic if needed, but backend handles basic fetching
    return { data: res.data.data };
  },

  getCaseProgress: async (caseId) => {
    try {
      // Fetch REAL case details
      const [detailsRes, activitiesRes] = await Promise.all([
        api.get(`/case/details/${caseId}`),
        api.get(`/case/activities/${caseId}`).catch(() => ({ data: { data: [] } }))
      ]);

      if (!detailsRes.data.success) return { data: null };

      const c = detailsRes.data.data;
      const activities = activitiesRes.data.data || [];

      // Calculate REAL metrics from the response arrays
      const timeline = c.timeline || [];
      const documents = c.documents || [];
      const updates = c.updates || [];

      return {
        data: {
          case: c,
          metrics: {
            total_updates: updates.length,
            total_documents: documents.length,
            total_timeline_events: timeline.length,
            last_update_time: c.updated_at || c.created_at
          },
          timeline: timeline,
          updates: updates,
          activities: activities,
          documents: documents
        }
      };
    } catch (e) {
      console.error("Failed to fetch detailed case report", e);
      return { data: null };
    }
  },

  getDocumentsReport: async (caseId) => {
    // If documents are needed separately
    try {
      const res = await api.get(`/case/details/${caseId}`);
      return { data: { documents: res.data.data.documents || [] } };
    } catch (e) {
      return { data: { documents: [] } }; // Empty if fail
    }
  },

  downloadCaseReport: async (caseId) => {
    // PDF Generation is backend logic, for now returning empty blob if endpoint is missing
    // or we can invoke a real generation endpoint if one exists.
    return { data: new Blob(['PDF Report Functionality Pending'], { type: 'application/pdf' }) };
  },

  runCustomReport: async (filters) => {
    const query = new URLSearchParams(filters).toString();
    const res = await api.get(`/reports/cases-list?${query}`);
    return { data: res.data.data };
  },

  getCaseIntelligenceReport: async (caseId) => {
    const res = await api.get(`/reports/intelligence/${caseId}`);
    return res.data;
  },

  generateCaseIntelligenceReport: async (caseId, formData) => {
    const res = await api.post(`/reports/intelligence/${caseId}/generate`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return res.data;
  }
};

export default reportsService;
