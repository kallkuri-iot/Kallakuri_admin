import axios from 'axios';
import { API_URL } from '../config';

// Get all tasks with optional filtering
export const getTasks = async (filters = {}) => {
  try {
    const { status, assignedTo, staffRole, type, creatorRole } = filters;
    
    let url = `${API_URL}/tasks?`;
    
    if (status && status !== 'all') {
      url += `status=${status}&`;
    }
    
    if (assignedTo && assignedTo !== 'all') {
      url += `assignedTo=${assignedTo}&`;
    }
    
    if (staffRole && staffRole !== 'all') {
      url += `staffRole=${staffRole}&`;
    }
    
    if (type && type !== 'all') {
      url += `type=${type}&`;
    }
    
    if (creatorRole && creatorRole !== 'all') {
      url += `creatorRole=${creatorRole}&`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Get task by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (taskId, status, report = null) => {
  try {
    const data = { status };
    if (report) {
      data.report = report;
    }
    
    const response = await axios.patch(`${API_URL}/tasks/${taskId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId} status:`, error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

// Create an internal task (simplified task)
export const createInternalTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_URL}/tasks/internal-task`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating internal task:', error);
    throw error;
  }
}; 