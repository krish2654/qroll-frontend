const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('qroll_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const authAPI = {
  googleLogin: async (credential) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await handleResponse(response);
      if (data.success && data.token) {
        localStorage.setItem('qroll_token', data.token);
        localStorage.setItem('qroll_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  },

  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      if (data.success && data.user) {
        localStorage.setItem('qroll_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  },

  setRole: async (role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/set-role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      });
      const data = await handleResponse(response);
      if (data.success && data.user) {
        localStorage.setItem('qroll_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Set role error:', error);
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      localStorage.removeItem('qroll_token');
      localStorage.removeItem('qroll_user');
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('qroll_token');
      localStorage.removeItem('qroll_user');
      return { success: false, error: error.message };
    }
  }
};

export const authStorage = {
  getToken: () => localStorage.getItem('qroll_token'),
  getUser: () => {
    const user = localStorage.getItem('qroll_user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    const token = localStorage.getItem('qroll_token');
    const user = localStorage.getItem('qroll_user');
    return !!(token && user);
  },
  clear: () => {
    localStorage.removeItem('qroll_token');
    localStorage.removeItem('qroll_user');
  }
};