import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach token automatically
api.interceptors.request.use(
  (config) => {
    // 1. Get token from localStorage - Scan for any available role-based token
    const roles = ['admin', 'lawyer', 'client', 'user'];
    let token = null;

    for (const r of roles) {
      const storedAuth = localStorage.getItem(`casexpert_auth_${r}`);
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          if (parsed.token) {
            token = parsed.token;
            // If we found a token, we check if it matches the current user's role 
            // but for simplicity and to support the request "stay logged in on different browsers"
            // we just take the first one found or the one that's "active".
            // In a real multi-session app, the interceptor might need to know WHICH role is calling.
            break;
          }
        } catch (e) {
          console.error(`Failed to parse auth token for ${r}`, e);
        }
      }
    }

    // Fallback to legacy key
    if (!token) {
      const legacyAuth = localStorage.getItem('casexpert_auth');
      if (legacyAuth) {
        try {
          const parsed = JSON.parse(legacyAuth);
          token = parsed.token;
        } catch (e) { }
      }
    }

    // 2. Attach to headers if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('🚀 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      hasAuth: !!token
    });

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      // Avoid logging sensitive data or massive objects
      size: response.headers['content-length']
    });
    return response;
  },
  (error) => {
    const errorResponse = error.response;

    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: errorResponse?.status,
      data: errorResponse?.data
    });

    // 1. Handle 401 Unauthorized (Session Expired / Invalid Token)
    if (errorResponse?.status === 401) {
      console.warn('⚠️ Session expired or unauthorized. Clearing affected session only...');
      
      // Find and remove ONLY the token that caused this 401 — leave other role sessions intact
      const roles = ['admin', 'lawyer', 'client', 'user'];
      const requestToken = error.config?.headers?.Authorization?.replace('Bearer ', '');
      
      if (requestToken) {
        roles.forEach(r => {
          const stored = localStorage.getItem(`casexpert_auth_${r}`);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.token === requestToken) {
                // Only remove the role that had the expired token
                localStorage.removeItem(`casexpert_auth_${r}`);
                console.warn(`⚠️ Cleared expired session for role: ${r}`);
              }
            } catch (e) {}
          }
        });
      }

      // Remove legacy key too
      localStorage.removeItem('casexpert_auth');

      // Dispatch a custom event so AuthContext can handle the redirect cleanly
      // This avoids a hard page reload which would break other open sessions
      window.dispatchEvent(new CustomEvent('casexpert:unauthorized', {
        detail: { expiredToken: requestToken }
      }));
    }

    // 2. Enhance network error messages
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.message = `Cannot connect to backend server. Please ensure the backend is running at ${API_BASE_URL}`;
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The server took too long to respond.';
    } else if (errorResponse?.status === 404) {
      error.message = 'API endpoint not found. Please check the backend routes.';
    } else if (errorResponse?.status === 500) {
      error.message = errorResponse?.data?.message || 'Internal server error';
    } else if (errorResponse?.data?.message) {
      // Pass through backend error message
      error.message = errorResponse.data.message;
    }

    return Promise.reject(error);
  }
);

// Helper to manually set token (Legacy support, but interceptor does the real work)
export const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
