import { api } from '../api';
import { API_URL } from '../config';

// Get all damage claims with optional filtering
export const getAllDamageClaims = async (filters = {}) => {
  try {
    const { status, distributorId } = filters;
    
    let url = `/damage-claims?`;
    
    if (status && status !== 'all') {
      url += `status=${status}&`;
    }
    
    if (distributorId && distributorId !== 'all') {
      url += `distributorId=${distributorId}&`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching damage claims:', error);
    throw error;
  }
};

// Get damage claim by ID
export const getDamageClaimById = async (id) => {
  try {
    const response = await api.get(`/damage-claims/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching damage claim ${id}:`, error);
    throw error;
  }
};

// Update damage claim status
export const updateDamageClaimStatus = async (id, data) => {
  try {
    const response = await api.patch(`/damage-claims/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating damage claim ${id}:`, error);
    throw error;
  }
};

// Get all distributors for damage claim form
export const getDistributorsForDamageClaims = async () => {
  try {
    const response = await api.get(`/damage-claims/distributors`);
    return response.data;
  } catch (error) {
    console.error('Error fetching distributors for damage claims:', error);
    throw error;
  }
};

// Delete damage claim
export const deleteDamageClaim = async (id) => {
  try {
    const response = await api.delete(`/damage-claims/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting damage claim ${id}:`, error);
    throw error;
  }
};

// Create a new damage claim
export const createDamageClaim = async (formData) => {
  try {
    const response = await api.post('/damage-claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating damage claim:', error);
    throw error;
  }
};

// Create replacement for damage claim
export const createReplacement = async (data) => {
  try {
    const response = await api.post('/damage-claims/replacement', data);
    return response.data;
  } catch (error) {
    console.error('Error creating replacement:', error);
    throw error;
  }
};