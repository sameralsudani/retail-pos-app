const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('pos_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Set auth token in localStorage
const setAuthToken = (token, user) => {
  const userData = { 
    token, 
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    phone: user.phone,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  localStorage.setItem('pos_user', JSON.stringify(userData));
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('pos_user');
};

// API request helper with auth
const authRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        removeAuthToken();
        window.location.href = '/login';
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('Auth API Request Error:', error);
    throw error;
  }
};

// Auth API methods
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }

      if (data.success) {
        setAuthToken(data.token, data.user);
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Registration failed'
        };
      }

      if (data.success) {
        setAuthToken(data.token, data.user);
      }

      return data;
    } catch (error) {
      console.error('Register API error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'No token found'
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to get profile'
        };
      }

      return data;
    } catch (error) {
      console.error('Get profile API error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get profile'
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      return await authRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      return await authRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        }),
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to change password'
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await authRequest('/auth/logout', {
        method: 'POST',
      });
      
      removeAuthToken();
      return response;
    } catch (error) {
      // Even if API call fails, remove token locally
      removeAuthToken();
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await authRequest('/auth/refresh', {
        method: 'POST',
      });

      if (response.success) {
        const currentUser = JSON.parse(localStorage.getItem('pos_user') || '{}');
        setAuthToken(response.token, currentUser);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to refresh token'
      };
    }
  },

  // Validate token
  validateToken: async () => {
    try {
      return await authRequest('/auth/validate');
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Token validation failed'
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    const userData = localStorage.getItem('pos_user');
    if (!token || !userData) return false;
    
    try {
      const parsed = JSON.parse(userData);
      return !!(token && parsed.id);
    } catch (error) {
      return false;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userData = localStorage.getItem('pos_user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        // Return user data without token for security
        const { token, ...user } = parsed;
        return user;
      } catch (error) {
        console.error('Error parsing user data:', error);
        removeAuthToken();
        return null;
      }
    }
    return null;
  }
};

export default authAPI;