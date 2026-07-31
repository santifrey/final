// =============================================
// API Client - Fetch wrapper with JWT injection
// =============================================

const API_BASE = 'https://final-vqrm.onrender.com/api';

/**
 * Make an API request with automatic JWT injection and error handling
 */
async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Inject JWT token if available
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Stringify body if it's an object
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - redirect to login
      if (response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login.html';
        return;
      }
      throw { status: response.status, ...data };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw { success: false, message: 'Error de conexión con el servidor' };
  }
}

// Convenience methods
const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};
