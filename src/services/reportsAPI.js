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
    console.log(`=== REPORTS API REQUEST ===`);
    console.log(`URL: ${API_BASE_URL}${endpoint}`);
    console.log('Method:', config.method || 'GET');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    console.log(`=== REPORTS API RESPONSE ===`);
    console.log(`Status: ${response.status}`);
    console.log('Data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('=== REPORTS API REQUEST ERROR ===');
    console.error('Endpoint:', endpoint);
    console.error('Error:', error);
    throw error;
  }
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

export default reportsAPI;