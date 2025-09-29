import { api } from '../api';

// Get all sales inquiries with optional filtering
export const getAllSalesInquiries = async (filters = {}) => {
  try {
    const { status, distributorName } = filters;
    
    let url = `/sales-inquiries?`;
    
    if (status && status !== 'all') {
      url += `status=${status}&`;
    }
    
    if (distributorName && distributorName !== 'all') {
      url += `distributorName=${distributorName}&`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales inquiries:', error);
    throw error;
  }
};

// Get sales inquiry by ID
export const getSalesInquiryById = async (id) => {
  try {
    const response = await api.get(`/sales-inquiries/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sales inquiry ${id}:`, error);
    throw error;
  }
};

// Create a new sales inquiry
export const createSalesInquiry = async (data) => {
  try {
    const response = await api.post('/sales-inquiries', data);
    return response.data;
  } catch (error) {
    console.error('Error creating sales inquiry:', error);
    throw error;
  }
};

// Update sales inquiry status
export const updateSalesInquiryStatus = async (id, data) => {
  try {
    const response = await api.patch(`/sales-inquiries/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating sales inquiry status ${id}:`, error);
    throw error;
  }
};

// Add manager comment to a sales inquiry
export const addManagerComment = async (id, comment) => {
  try {
    const response = await api.patch(`/sales-inquiries/${id}/comment`, { comment });
    return response.data;
  } catch (error) {
    console.error(`Error adding manager comment to sales inquiry ${id}:`, error);
    throw error;
  }
};

// Get user's sales inquiries
export const getUserSalesInquiries = async () => {
  try {
    const response = await api.get('/mobile/sales-inquiries/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user sales inquiries:', error);
    throw error;
  }
};

// Delete sales inquiry
export const deleteSalesInquiry = async (id) => {
  try {
    const response = await api.delete(`/sales-inquiries/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting sales inquiry ${id}:`, error);
    throw error;
  }
};

// Get all distributors for the dropdown
export const getDistributorsForSalesInquiries = async () => {
  try {
    const response = await api.get('/distributors');
    return response.data;
  } catch (error) {
    console.error('Error fetching distributors:', error);
    throw error;
  }
};

// Handle dispatch operations
export const dispatchSalesInquiry = async (inquiryId, dispatchData) => {
  try {
    const response = await api.patch(`/mobile/sales-inquiries/${inquiryId}/dispatch`, dispatchData);
    return response.data;
  } catch (error) {
    console.error(`Error dispatching sales inquiry ${inquiryId}:`, error);
    throw error;
  }
};

// Get dispatch status and details
export const getDispatchDetails = async (inquiryId) => {
  try {
    const response = await api.get(`/sales-inquiries/${inquiryId}/dispatch`);
    return response.data;
  } catch (error) {
    console.error(`Error getting dispatch details for inquiry ${inquiryId}:`, error);
    throw error;
  }
};