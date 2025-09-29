// API URL configuration
export const API_URL = process.env.REACT_APP_API_URL || '/api';

// Authentication settings
export const TOKEN_KEY = 'kallakuri_admin_token';
export const USER_KEY = 'kallakuri_admin_user';

// Pagination settings
export const DEFAULT_PAGE_SIZE = 10;

// Status options
export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];

// Staff roles
export const STAFF_ROLES = ['Marketing Staff', 'Godown Incharge', 'Mid-Level Manager', 'App Developer', 'Administrator'];

// Task types
export const TASK_TYPES = ['internal', 'external', 'regular']; 