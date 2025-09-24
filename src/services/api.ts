const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
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
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
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
    // Add retry logic with exponential backoff
    let retries = 2;
    let lastError;
    let delay = 1000;
    
    while (retries > 0) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        const data = await response.json();

        if (!response.ok) {
          // Handle authentication errors
          if (response.status === 401) {
            localStorage.removeItem('pos_user');
            // Don't redirect immediately on refresh, let the auth context handle it
            if (!window.location.pathname.includes('/login')) {
              setTimeout(() => {
                window.location.href = '/login';
              }, 100);
            }
            throw new Error('Authentication required');
          }
          throw new Error(data.message || 'API request failed');
        }

        return data;
      } catch (error) {
        lastError = error;
        
        // Don't retry auth errors, client errors, or CORS errors
        if (error.message.includes('401') || 
            error.message.includes('400') || 
            error.message.includes('CORS') ||
            error.name === 'TypeError' && error.message.includes('CORS')) {
          throw error;
        }
        
        // Only retry network errors with exponential backoff
        if (retries > 1 && (error.name === 'TypeError' || error.message.includes('fetch'))) {
          console.log(`API request failed, retrying in ${delay}ms... (${retries - 1} attempts left)`);
          retries--;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  } catch (error) {
    // Handle different types of errors gracefully
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    
    if (error.message.includes('CORS')) {
      console.error('CORS error detected:', error);
      throw new Error('CORS error - please refresh the page');
    }
    
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const requestData = { email, password };
    
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  register: async (userData: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
  },

  updateProfile: async (profileData: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
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
  register: async (tenantData: any) => {
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

  updateSettings: async (settingsData: any) => {
    return apiRequest('/tenants/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },
};

// Products API
export const productsAPI = {
  getAll: async (params: Record<string, unknown> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/products/${id}`);
  },

  getByBarcode: async (code: string) => {
    return apiRequest(`/products/barcode/${code}`);
  },

  create: async (productData: any) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  createWithImage: async (formData: FormData) => {
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

  update: async (id: string, productData: any) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<any> => {
    return apiRequest('/categories');
  },

  getById: async (id: string) => {
    return apiRequest(`/categories/${id}`);
  },

  create: async (categoryData: any) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  update: async (id: string, categoryData: any) => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  createWithImage: async (formData: FormData) => {
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

  updateWithImage: async (id: string, formData: FormData) => {
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
  getAll: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/customers/${id}`);
  },

  create: async (customerData: any) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  update: async (id: string, customerData: any) => {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (): Promise<any> => {
    return apiRequest('/customers/stats/summary');
  },

  updateLoyalty: async (id: string, loyaltyData: any) => {
    return apiRequest(`/customers/${id}/loyalty`, {
      method: 'PUT',
      body: JSON.stringify(loyaltyData),
    });
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/transactions/${id}`);
  },

  create: async (transactionData: any) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  getStats: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transactions/stats/summary${queryString ? `?${queryString}` : ''}`);
  },
};

// Suppliers API
export const suppliersAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/suppliers${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/suppliers/${id}`);
  },

  create: async (supplierData: any) => {
    return apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  update: async (id: string, supplierData: any) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },

  create: async (userData: any) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, userData: any) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (): Promise<any> => {
    return apiRequest('/users/stats/summary');
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<any> => {
    return apiRequest('/health');
  },
};

// Reports API
export const reportsAPI = {
  // Get overview report data
  getOverview: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/overview${queryString ? `?${queryString}` : ''}`);
  },

  // Get daily sales data
  getDailySales: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/daily-sales${queryString ? `?${queryString}` : ''}`);
  },

  // Get top products report
  getTopProducts: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/top-products${queryString ? `?${queryString}` : ''}`);
  },

  // Get category sales report
  getCategorySales: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/category-sales${queryString ? `?${queryString}` : ''}`);
  },

  // Get sales trends
  getSalesTrends: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/sales-trends${queryString ? `?${queryString}` : ''}`);
  },

  // Get inventory report
  getInventoryReport: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/inventory${queryString ? `?${queryString}` : ''}`);
  },

  // Get customer report
  getCustomerReport: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reports/customers${queryString ? `?${queryString}` : ''}`);
  }
};

// Settings API
export const settingsAPI = {
  // Get system settings
  getSettings: async (): Promise<any> => {
    return apiRequest('/settings');
  },

  // Update system settings
  updateSettings: async (settingsData: any) => {
    return apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  },

  // Reset settings to defaults
  resetSettings: async (): Promise<any> => {
    return apiRequest('/settings/reset', {
      method: 'POST',
    });
  }
};

// Clients API
export const clientsAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/clients${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/clients/${id}`);
  },

  create: async (clientData: any) => {
    return apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  },

  update: async (id: string, clientData: any) => {
    return apiRequest(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (): Promise<any> => {
    return apiRequest('/clients/stats/summary');
  }
};

// Employees API
export const employeesAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/employees${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/employees/${id}`);
  },

  create: async (employeeData: any) => {
    return apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  update: async (id: string, employeeData: any) => {
    return apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (): Promise<any> => {
    return apiRequest('/employees/stats/summary');
  }
};