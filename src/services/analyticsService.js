import { api } from './api';

// Get overview analytics for dashboard
export const getOverviewAnalytics = async (timeRange = 'last30days') => {
  try {
    const response = await api.get(`/analytics/overview`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    throw error;
  }
};

// Get damage claims analytics
export const getDamageClaimsAnalytics = async (timeRange = 'last30days') => {
  try {
    const response = await api.get(`/analytics/damage-claims`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching damage claims analytics:', error);
    throw error;
  }
};

// Get order analytics
export const getOrderAnalytics = async (timeRange = 'last30days') => {
  try {
    const response = await api.get(`/analytics/orders`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    throw error;
  }
};

// Get staff activity analytics
export const getStaffActivityAnalytics = async (timeRange = 'last30days') => {
  try {
    const response = await api.get(`/analytics/staff-activity`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff activity analytics:', error);
    throw error;
  }
};

// Get market inquiry analytics
export const getMarketInquiryAnalytics = async (filters = {}) => {
  try {
    const response = await api.get(`/analytics/market-inquiry`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market inquiry analytics:', error);
    throw error;
  }
};

// Get brand order analytics
export const getBrandOrderAnalytics = async (filters = {}) => {
  try {
    // Handle multiple distributor IDs
    const params = { ...filters };
    if (filters.distributorIds && Array.isArray(filters.distributorIds)) {
      // Convert array to multiple query parameters
      filters.distributorIds.forEach(id => {
        if (!params.distributorId) {
          params.distributorId = [];
        }
        if (!Array.isArray(params.distributorId)) {
          params.distributorId = [params.distributorId];
        }
        params.distributorId.push(id);
      });
      delete params.distributorIds;
    }
    
    const response = await api.get(`/analytics/brand-orders`, {
      params,
      paramsSerializer: (params) => {
        // Handle array parameters properly
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (Array.isArray(params[key])) {
            params[key].forEach(value => {
              searchParams.append(key, value);
            });
          } else if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        return searchParams.toString();
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching brand order analytics:', error);
    throw error;
  }
};

// Get inventory analysis
export const getInventoryAnalysis = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add query parameters
    if (params.timeRange) queryParams.append('timeRange', params.timeRange);
    if (params.distributorId) queryParams.append('distributorId', params.distributorId);
    if (params.staffId) queryParams.append('staffId', params.staffId);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    
    const response = await api.get(`/analytics/inventory-analysis?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory analysis:', error);
    throw error;
  }
};

// Export all services
const analyticsService = {
  getOverviewAnalytics,
  getDamageClaimsAnalytics,
  getOrderAnalytics,
  getStaffActivityAnalytics,
  getMarketInquiryAnalytics,
  getBrandOrderAnalytics,
  getInventoryAnalysis
};

export default analyticsService; 