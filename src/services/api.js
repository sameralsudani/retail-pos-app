const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get tenant identifier (for development, use demo1 as default)
const getTenantId = () => {
  // Check if we have a stored tenant from registration
  const storedUser = localStorage.getItem('pos_user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      if (userData.tenantId) {
        console.log('Found tenant from localStorage:', userData.tenantId);
        return userData.tenantId;
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
  }
  
  // No tenant identifier found - will be handled by authentication
  console.log('No tenant identifier found, will use authenticated user tenant');
  return null;
};

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

// API request helper
const apiRequest = async (endpoint, options = {}) => {
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
    
    // Handle CORS and network errors
    if (!response.ok && response.status === 0) {
      throw new Error('Network error - please check your connection');
    }
    
    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('pos_user');
        window.location.href = '/login';
        return;
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    // Handle network errors gracefully
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const requestData = { email, password };
    
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword
      }),
    });
  },
};

// Tenants API
export const tenantsAPI = {
  register: async (tenantData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tenants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Tenant registration error:', error);
      throw error;
    }
  },


  getInfo: async () => {
    return apiRequest('/tenants/info');
  },

  updateSettings: async (settingsData) => {
    return apiRequest('/tenants/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/products/${id}`);
  },

  getByBarcode: async (code) => {
    return apiRequest(`/products/barcode/${code}`);
  },

  create: async (productData) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  createWithImage: async (formData) => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Create product with image error:', error);
      throw error;
    }
  },

  update: async (id, productData) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return apiRequest('/categories');
  },

  getById: async (id) => {
    return apiRequest(`/categories/${id}`);
  },

  create: async (categoryData) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (id, categoryData) => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  createWithImage: async (formData) => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Create category with image error:', error);
      throw error;
    }
  },

  updateWithImage: async (id, formData) => {
    const token = getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Update category with image error:', error);
      throw error;
    }
  },
};

// Customers API
export const customersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/customers/${id}`);
  },

  create: async (customerData) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  update: async (id, customerData) => {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  updateLoyalty: async (id, loyaltyData) => {
    return apiRequest(`/customers/${id}/loyalty`, {
      method: 'PUT',
      body: JSON.stringify(loyaltyData),
    });
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/transactions/${id}`);
  },

  create: async (transactionData) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transactions/stats/summary${queryString ? `?${queryString}` : ''}`);
  },
};

// Suppliers API
export const suppliersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/suppliers${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/suppliers/${id}`);
  },

  create: async (supplierData) => {
    return apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  update: async (id, supplierData) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/users/${id}`);
  },

  create: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return apiRequest('/users/stats/summary');
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};

// Reports API
export const reportsAPI = {
  // Get overview report data
  getOverview: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/overview${queryString ? `?${queryString}` : ''}`);
  },

  // Get daily sales data
  getDailySales: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/daily-sales${queryString ? `?${queryString}` : ''}`);
  },

  // Get top products report
  getTopProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/top-products${queryString ? `?${queryString}` : ''}`);
  },

  // Get category sales report
  getCategorySales: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/category-sales${queryString ? `?${queryString}` : ''}`);
  },

  // Get sales trends
  getSalesTrends: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/sales-trends${queryString ? `?${queryString}` : ''}`);
  },

  // Get inventory report
  getInventoryReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/inventory${queryString ? `?${queryString}` : ''}`);
  },

  // Get customer report
  getCustomerReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/customers${queryString ? `?${queryString}` : ''}`);
  }
};

// Settings API
export const settingsAPI = {
  // Get system settings
  getSettings: async () => {
    return apiRequest('/settings');
  },

  // Update system settings
  updateSettings: async (settingsData) => {
    return apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  // Reset settings to defaults
  resetSettings: async () => {
    return apiRequest('/settings/reset', {
      method: 'POST',
    });
  }
};