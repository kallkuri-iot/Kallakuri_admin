import axios from 'axios';
import { TOKEN_KEY, USER_KEY } from './config';

// Create an axios instance
export const api = axios.create({
  // baseURL: API_URL,
  // baseURL: 'http://localhost:5050/api',
  //baseURL: 'https://kallakuri.volvrit.org/api',
  baseURL: 'https://api.helloandhellomrk.in/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're already refreshing the token to prevent multiple refreshes
let isRefreshing = false;
// Store failed requests to retry after token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Check for token expiration warning headers
    const expiresSoon = response.headers?.['x-token-expires-soon'];
    
    if (expiresSoon === 'true' && !isRefreshing) {
      // Trigger a token refresh in the background
      authService.refreshToken().catch(error => {
        console.error('Background token refresh failed:', error);
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Avoid infinite loop of retrying already failed refresh attempts
    if (originalRequest.url === '/auth/me' && originalRequest._retry) {
      // We already tried to refresh once, logout
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response.data?.code;
      
      // Only attempt refresh for specific error codes
      if (['TOKEN_EXPIRED', 'TOKEN_EXPIRING'].includes(errorCode)) {
        if (isRefreshing) {
          try {
            // Wait for the existing refresh to complete
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return api(originalRequest);
            }).catch(err => Promise.reject(err));
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await api.post('/auth/refresh-token');
          if (data.success && data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            // Process failed queue
            processQueue(null, data.token);
            
            // Retry the original request
            originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          
          // Clear tokens and redirect to login
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', 
      { email, password },
      {
        headers: {
          'x-admin-panel': 'true'
        }
      }
    );
    return response.data;
  },
  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      // Don't throw an error for getProfile as it's used to check auth state
      // Instead return a failure result the caller can handle
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get profile'
      };
    }
  },
  getMobileProfile: async () => {
    try {
      const response = await api.get('/mobile/auth/profile');
      return response.data;
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to get mobile profile'
      };
    }
  },
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.patch('/auth/update-password', { currentPassword, newPassword });
    return response.data;
  },
  // Sub-admin management APIs
  getSubAdmins: async () => {
    const response = await api.get('/auth/sub-admins');
    return response.data;
  },
  getSubAdmin: async (id) => {
    const response = await api.get(`/auth/sub-admins/${id}`);
    return response.data;
  },
  createSubAdmin: async (subAdminData) => {
    const response = await api.post('/auth/create-sub-admin', subAdminData);
    return response.data;
  },
  updateSubAdmin: async (id, subAdminData) => {
    const response = await api.put(`/auth/sub-admins/${id}`, subAdminData);
    return response.data;
  },
  deleteSubAdmin: async (id) => {
    const response = await api.delete(`/auth/sub-admins/${id}`);
    return response.data;
  },
  // New method to get all users for task assignment
  getAllUsers: async () => {
    const response = await api.get('/auth/all-users');
    return response.data;
  }
};

// Staff services
export const staffService = {
  getAllStaff: async (page = 1, limit = 10, role, active, sort) => {
    let url = `/staff?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    if (active !== undefined) url += `&active=${active}`;
    if (sort) url += `&sort=${sort}`;
    
    const response = await api.get(url);
    return response.data;
  },
  getStaffById: async (id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },
  getStaffByRole: async (role) => {
    const response = await api.get(`/staff/by-role/${role}`);
    return response.data;
  },
  createStaff: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },
  updateStaff: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  },
  resetPassword: async (id, newPassword) => {
    const response = await api.post(`/staff/${id}/reset-password`, { newPassword });
    return response.data;
  },
  toggleStatus: async (id) => {
    const response = await api.patch(`/staff/${id}/toggle-status`);
    return response.data;
  },
  deleteStaff: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
  getStaffStats: async () => {
    const response = await api.get('/staff/dashboard/stats');
    return response.data;
  }
};

// Distributor services
export const distributorService = {
  getAllDistributors: async () => {
    const response = await api.get('/distributors');
    return response.data;
  },
  getDistributorById: async (id) => {
    const response = await api.get(`/distributors/${id}`);
    return response.data;
  },
  getDistributorDetails: async (id) => {
    const response = await api.get(`/distributors/${id}`);
    return response.data;
  },
  createDistributor: async (distributorData) => {
    const response = await api.post('/distributors', distributorData);
    return response.data;
  },
  updateDistributor: async (id, distributorData) => {
    const response = await api.put(`/distributors/${id}`, distributorData);
    return response.data;
  },
  deleteDistributor: async (id) => {
    const response = await api.delete(`/distributors/${id}`);
    return response.data;
  },
  addRetailShop: async (id, shopData) => {
    const response = await api.post(`/distributors/${id}/retail-shops`, shopData);
    return response.data;
  },
  addWholesaleShop: async (id, shopData) => {
    const response = await api.post(`/distributors/${id}/wholesale-shops`, shopData);
    return response.data;
  },
  getInitialStockEstimate: async (id) => {
    const response = await api.get(`/supply-estimates/initial/${id}`);
    return response.data;
  },
  getProposedMarketRate: async (id) => {
    const response = await api.get(`/supply-estimates/market-rate/${id}`);
    return response.data;
  }
};

// Task services
export const taskService = {
  getAllTasks: async (filters = {}) => {
    const { status, assignedTo, staffRole, type, creatorRole } = filters;
    let url = '/tasks';
    const params = new URLSearchParams();
    
    // Add basic filters
    if (status) params.append('status', status);
    if (assignedTo) params.append('assignedTo', assignedTo);
    if (staffRole) params.append('staffRole', staffRole);
    if (type) params.append('type', type);
    
    // Handle creatorRole as either a string or array
    if (creatorRole) {
      console.log("API service adding creatorRole filter:", creatorRole);
      
      if (Array.isArray(creatorRole)) {
        // If it's an array, add multiple creatorRole parameters
        creatorRole.forEach(role => {
          console.log(`Adding creatorRole param: ${role}`);
          params.append('creatorRole', role);
        });
      } else {
        // If it's a string, add a single parameter
        console.log(`Adding single creatorRole param: ${creatorRole}`);
        params.append('creatorRole', creatorRole);
      }
    }
    
    // Log the final URL with params
    const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
    console.log("API request URL:", finalUrl);
    
    const response = await api.get(finalUrl);
    return response.data;
  },
  
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  // New method to get tasks created by a specific user
  getTasksByCreator: async (userId) => {
    const response = await api.get(`/tasks/created-by/${userId}`);
    return response.data;
  },
  
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  
  updateTaskStatus: async (id, newStatus, report) => {
    const response = await api.patch(`/tasks/${id}`, { 
      status: newStatus,
      report: report || ''
    });
    return response.data;
  },
  
  // New method for creating internal tasks with simplified API
  createInternalTask: async (taskData) => {
    const response = await api.post('/tasks/internal-task', taskData);
    return response.data;
  },
  
  // New method for mobile app to get assigned tasks
  getMyAssignedTasks: async (status) => {
    let url = '/mobile/tasks/assigned';
    if (status) url += `?status=${status}`;
    const response = await api.get(url);
    return response.data;
  },
  
  // New method for mobile app to get all tasks related to the user (created or assigned)
  getMyTasks: async (status) => {
    let url = '/mobile/tasks/my-tasks';
    if (status) url += `?status=${status}`;
    const response = await api.get(url);
    return response.data;
  },
  
  // Method to delete a task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  
  // Method to delete a task from mobile app
  deleteTaskMobile: async (id) => {
    const response = await api.delete(`/mobile/tasks/${id}/delete`);
    return response.data;
  }
};

// Supply Estimate services
export const supplyEstimateService = {
  getAllSupplyEstimates: async (page = 1, limit = 10, distributorId, status) => {
    let url = `/supply-estimates?page=${page}&limit=${limit}`;
    if (distributorId) url += `&distributorId=${distributorId}`;
    if (status) url += `&status=${status}`;
    
    const response = await api.get(url);
    return response.data;
  },
  getSupplyEstimateById: async (id) => {
    const response = await api.get(`/supply-estimates/${id}`);
    return response.data;
  },
  createSupplyEstimate: async (estimateData) => {
    const response = await api.post('/supply-estimates', estimateData);
    return response.data;
  },
  approveSupplyEstimate: async (id, notes) => {
    const response = await api.patch(`/supply-estimates/${id}/approve`, { notes });
    return response.data;
  },
  rejectSupplyEstimate: async (id, reason) => {
    const response = await api.patch(`/supply-estimates/${id}/reject`, { reason });
    return response.data;
  },
  getEstimatesByDistributor: async (distributorId, status, estimateType) => {
    let url = `/supply-estimates/distributor/${distributorId}`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (estimateType) params.append('estimateType', estimateType);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  createInitialEstimate: async (distributorId, estimateData) => {
    const payload = {
      ...estimateData,
      distributorId,
      estimateType: 'Initial'
    };
    const response = await api.post('/supply-estimates', payload);
    return response.data;
  },
  createMarketRateEstimate: async (distributorId, estimateData) => {
    const payload = {
      ...estimateData,
      distributorId,
      estimateType: 'Market'
    };
    const response = await api.post('/supply-estimates', payload);
    return response.data;
  }
};

// Brand services
export const brandService = {
  getAllBrands: async () => {
    const response = await api.get('/brands');
    return response.data;
  },
  getBrandById: async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
  createBrand: async (brandData) => {
    const response = await api.post('/brands', brandData);
    return response.data;
  },
  updateBrand: async (id, brandData) => {
    const response = await api.put(`/brands/${id}`, brandData);
    return response.data;
  },
  deleteBrand: async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  }
};

// Variant services
export const variantService = {
  getAllVariants: async (brandId) => {
    let url = '/variants';
    if (brandId) url += `?brand=${brandId}`;
    
    const response = await api.get(url);
    return response.data;
  },
  getVariantById: async (id) => {
    const response = await api.get(`/variants/${id}`);
    return response.data;
  },
  createVariant: async (variantData) => {
    const response = await api.post('/variants', variantData);
    return response.data;
  },
  updateVariant: async (id, variantData) => {
    const response = await api.put(`/variants/${id}`, variantData);
    return response.data;
  },
  deleteVariant: async (id) => {
    const response = await api.delete(`/variants/${id}`);
    return response.data;
  },
  addSize: async (id, sizeName) => {
    const response = await api.post(`/variants/${id}/sizes`, { name: sizeName });
    return response.data;
  }
};

// Product services
export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  addVariant: async (id, variantData) => {
    const response = await api.post(`/products/${id}/variants`, variantData);
    return response.data;
  },
  updateVariant: async (id, variantId, variantData) => {
    const response = await api.put(`/products/${id}/variants/${variantId}`, variantData);
    return response.data;
  },
  addSize: async (id, variantId, sizeData) => {
    const response = await api.post(`/products/${id}/variants/${variantId}/sizes`, sizeData);
    return response.data;
  },
  updateSize: async (id, variantId, sizeId, sizeData) => {
    const response = await api.put(`/products/${id}/variants/${variantId}/sizes/${sizeId}`, sizeData);
    return response.data;
  }
};

// Marketing Staff Activity services
export const marketingStaffActivityService = {
  getAllActivities: async (staffId, distributorId, fromDate, toDate, status, page = 1, limit = 10) => {
    let url = '/marketing-activity';
    const params = new URLSearchParams();
    if (staffId) params.append('staffId', staffId);
    if (distributorId) params.append('distributorId', distributorId);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  getActivityById: async (id) => {
    const response = await api.get(`/marketing-activity/${id}`);
    return response.data;
  },
  deleteActivity: async (id) => {
    const response = await api.delete(`/marketing-activity/${id}`);
    return response.data;
  },
  getActivitiesByDistributor: async (staffId, distributorName, date) => {
    let url = '/marketing-activity';
    const params = new URLSearchParams();
    if (staffId) params.append('staffId', staffId);
    if (distributorName) params.append('distributor', distributorName);
    if (date) params.append('date', date);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  // New method to get activities by distributorId
  getActivitiesByDistributorId: async (distributorId, filters = {}) => {
    const { staffId, fromDate, toDate, status, page = 1, limit = 10 } = filters;
    
    let url = `/marketing-activity/distributor/${distributorId}`;
    const params = new URLSearchParams();
    
    if (staffId) params.append('staffId', staffId);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  // Mobile app endpoints
  punchIn: async (activityData) => {
    const response = await api.post('/mobile/marketing-activity/punch-in', activityData);
    return response.data;
  },
  punchOut: async (id, additionalData) => {
    const response = await api.patch(`/mobile/marketing-activity/${id}/punch-out`, additionalData);
    return response.data;
  },
  getMyActivities: async (date, distributorId) => {
    let url = '/mobile/marketing-activity/my-activities';
    const params = new URLSearchParams();
    
    if (date) params.append('date', date);
    if (distributorId) params.append('distributorId', distributorId);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  // Get assigned distributors for the current staff
  getAssignedDistributors: async () => {
    const response = await api.get('/mobile/marketing-activity/assigned-distributors');
    return response.data;
  }
};

// Retailer Shop Activity services
export const retailerShopActivityService = {
  // Get all activities
  getAllActivities: async (params = {}) => {
    const response = await api.get('/retailer-shop-activity', { params });
    return response.data;
  },

  // Get activities grouped by task
  getActivitiesGroupedByTask: async (params = {}) => {
    const response = await api.get('/retailer-shop-activity/grouped-by-task', { params });
    return response.data;
  },

  // Get single activity
  getActivity: async (id) => {
    const response = await api.get(`/retailer-shop-activity/${id}`);
    return response.data;
  },

  // Get activities by distributor
  getActivitiesByDistributor: async (distributorId, params = {}) => {
    const response = await api.get(`/retailer-shop-activity/distributor/${distributorId}`, { params });
    return response.data;
  },

  // Get activities by shop
  getActivitiesByShop: async (shopId, params = {}) => {
    const response = await api.get(`/retailer-shop-activity/shop/${shopId}`, { params });
    return response.data;
  },

  // Create or update activity
  createOrUpdateActivity: async (activityData) => {
    const response = await api.post('/mobile/retailer-shop-activity', activityData);
    return response.data;
  },

  // Get alternate providers
  getAlternateProviders: async (params = {}) => {
    const response = await api.get('/retailer-shop-activity/alternate-providers', { params });
    return response.data;
  },

  // Add MLM comment to alternate provider
  addMLMComment: async (activityId, providerId, comment) => {
    const response = await api.patch(`/retailer-shop-activity/${activityId}/alternate-provider/${providerId}/comment`, {
      comment
    });
    return response.data;
  },

  // Fetch all shops with their sales orders for a distributor
  getDistributorShopsSalesOrders: async (distributorId, startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get('/mobile/retailer-shop-activity/distributor-shops-sales-orders', { params });
    return response.data;
  },
  
  getMyActivities: async (filters = {}) => {
    let queryParams = new URLSearchParams();
    
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.distributorId) queryParams.append('distributorId', filters.distributorId);
    if (filters.shopId) queryParams.append('shopId', filters.shopId);
    
    const response = await api.get(`/mobile/retailer-shop-activity/my-activities?${queryParams.toString()}`);
    return response.data;
  },
  
  // New mobile app alternate provider methods
  getMobileAlternateProviders: async (filters = {}) => {
    const { distributorId, dateFrom, dateTo, brandName } = filters;
    const queryParams = new URLSearchParams();
    
    if (distributorId) queryParams.append('distributorId', distributorId);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    if (brandName) queryParams.append('brandName', brandName);
    
    const response = await api.get(`/mobile/retailer-shop-activity/alternate-providers?${queryParams.toString()}`);
    return response.data;
  },
  
  addMobileAlternateProviderComment: async (activityId, providerId, comment) => {
    const response = await api.patch(
      `/mobile/retailer-shop-activity/${activityId}/alternate-provider/${providerId}/comment`,
      { comment }
    );
    return response.data;
  }
};

// Damage Claims services
export const damageClaimService = {
  getAllDamageClaims: async (filters = {}) => {
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
  },
  
  getDamageClaimById: async (id) => {
    const response = await api.get(`/damage-claims/${id}`);
    return response.data;
  },
  
  updateDamageClaimStatus: async (id, data) => {
    const response = await api.patch(`/damage-claims/${id}`, data);
    return response.data;
  },
  
  getDistributorsForDamageClaims: async () => {
    const response = await api.get(`/damage-claims/distributors`);
    return response.data;
  },
  
  deleteDamageClaim: async (id) => {
    const response = await api.delete(`/damage-claims/${id}`);
    return response.data;
  },
  
  createDamageClaim: async (formData) => {
    const response = await api.post('/damage-claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  uploadDamageImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/damage-claims/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  addMLMComment: async (claimId, comment) => {
    const response = await api.patch(`/damage-claims/${claimId}/mlm-comment`, { comment });
    return response.data;
  },
  
  processDamageClaim: async (claimId, { status, adminComment, approvedPieces }) => {
    const response = await api.patch(`/damage-claims/${claimId}/process`, {
      status,
      adminComment,
      approvedPieces
    });
    return response.data;
  },
  
  getDamageClaimByTracking: async (trackingId) => {
    const response = await api.get(`/damage-claims/tracking/${trackingId}`);
    return response.data;
  },
  
  // Mobile app endpoints
  getMyDamageClaims: async (status = '') => {
    let url = '/mobile/damage-claims/my-claims';
    if (status) {
      url += `?status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  
  submitDamageClaim: async (damageData) => {
    const response = await api.post('/mobile/damage-claims', damageData);
    return response.data;
  },
  
  // MLM mobile endpoints
  getMLMAllDamageClaims: async (status = '', page = 1, limit = 10) => {
    let url = '/mobile/damage-claims/mlm/all';
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getMLMPendingDamageClaims: async () => {
    const response = await api.get('/mobile/damage-claims/mlm/pending');
    return response.data;
  },
  
  addMLMCommentMobile: async (claimId, comment) => {
    const response = await api.patch(`/mobile/damage-claims/mlm/${claimId}/comment`, { comment });
    return response.data;
  },
  
  // Get details of specific damage claim for MLM
  getMLMDamageClaimById: async (claimId) => {
    const response = await api.get(`/mobile/damage-claims/mlm/${claimId}`);
    return response.data;
  },
  
  // Godown Incharge mobile endpoints
  getGodownAllDamageClaims: async (status = '', page = 1, limit = 10) => {
    let url = '/mobile/damage-claims/godown/all';
    const params = new URLSearchParams();
    
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getGodownApprovedClaims: async () => {
    const response = await api.get('/mobile/damage-claims/godown/approved');
    return response.data;
  },
  
  getGodownClaimByTracking: async (trackingId) => {
    const response = await api.get(`/mobile/damage-claims/godown/tracking/${trackingId}`);
    return response.data;
  },
  
  // Get details of specific damage claim for Godown Incharge
  getGodownDamageClaimById: async (claimId) => {
    const response = await api.get(`/mobile/damage-claims/godown/${claimId}`);
    return response.data;
  }
};

// Sales Inquiry services
export const salesInquiryService = {
  getAllSalesInquiries: async (filters = {}) => {
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
  },
  
  getSalesInquiryById: async (id) => {
    const response = await api.get(`/sales-inquiries/${id}`);
    return response.data;
  },
  
  createSalesInquiry: async (data) => {
    const response = await api.post('/sales-inquiries', data);
    return response.data;
  },
  
  updateSalesInquiryStatus: async (id, data) => {
    const response = await api.patch(`/sales-inquiries/${id}`, data);
    return response.data;
  },
  
  // Mobile app endpoints for all authorized users (Marketing Staff, MLM, Godown Incharge, Admin)
  getUserSalesInquiries: async (status = '') => {
    let url = '/mobile/sales-inquiries/my-inquiries';
    if (status) {
      url += `?status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  
  // Get details of a specific sales inquiry from mobile
  getMobileSalesInquiry: async (inquiryId) => {
    const response = await api.get(`/mobile/sales-inquiries/${inquiryId}`);
    return response.data;
  },
  
  deleteSalesInquiry: async (id) => {
    const response = await api.delete(`/sales-inquiries/${id}`);
    return response.data;
  },
  
  getDistributorsForSalesInquiries: async () => {
    const response = await api.get('/distributors');
    return response.data;
  },
  
  addManagerComment: async (id, comment) => {
    const response = await api.patch(`/sales-inquiries/${id}/comment`, { comment });
    return response.data;
  },
  
  // Mobile endpoint for MLM to add comment
  addMobileManagerComment: async (id, comment) => {
    const response = await api.patch(`/mobile/sales-inquiries/${id}/comment`, { comment });
    return response.data;
  },
  
  // Mobile endpoint for Godown Incharge to dispatch orders
  dispatchOrder: async (inquiryId, dispatchData) => {
    const response = await api.patch(
      `/mobile/sales-inquiries/${inquiryId}/dispatch`, 
      dispatchData
    );
    return response.data;
  }
};

// Staff Activity services
export const staffActivityService = {
  getAllActivities: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/staff-activity?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff activities:', error);
      throw error;
    }
  },
  getActivityById: async (id) => {
    try {
    const response = await api.get(`/staff-activity/${id}`);
    return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  },
  createActivity: async (activityData) => {
    const response = await api.post('/staff-activity', activityData);
    return response.data;
  },
  updateActivity: async (id, activityData) => {
    const response = await api.put(`/staff-activity/${id}`, activityData);
    return response.data;
  },
  punchOut: async (id, additionalData) => {
    const response = await api.patch(`/staff-activity/${id}/punch-out`, additionalData);
    return response.data;
  },
  // Mobile app endpoints
  punchIn: async (activityData) => {
    const response = await api.post('/mobile/staff-activity/punch-in', activityData);
    return response.data;
  },
  getMyActivities: async (filters = {}) => {
    const { date, staffType } = filters;
    let url = '/mobile/staff-activity/my-activities';
    const params = new URLSearchParams();
    
    if (date) params.append('date', date);
    if (staffType) params.append('staffType', staffType);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  }
};

// Staff Activity API
export const staffActivityApi = {
  // Get all staff activities
  getStaffActivities: async (params = {}) => {
    const response = await api.get('/staff-activity', { params });
    return response.data;
  },

  // Get staff activities grouped by task
  getStaffActivitiesGroupedByTask: async (params = {}) => {
    const response = await api.get('/staff-activity/grouped-by-task', { params });
    return response.data;
  },

  // Get single staff activity
  getStaffActivity: async (id) => {
    const response = await api.get(`/staff-activity/${id}`);
    return response.data;
  },

  // Punch out staff activity (now using taskId)
  punchOutStaffActivity: async (taskId, additionalData = {}) => {
    const response = await api.patch(`/staff-activity/punch-out`, { 
      taskId, 
      ...additionalData 
    });
    return response.data;
  },

  // Get staff activities by distributor
  getStaffActivitiesByDistributor: async (distributorId, params = {}) => {
    const response = await api.get(`/staff-activity/distributor/${distributorId}`, { params });
    return response.data;
  }
};

// Shop services
export const shopService = {
  getAllShops: async () => {
    const response = await api.get('/shops');
    return response.data;
  },
  getShopsByDistributor: async (distributorId, type) => {
    let url = `/shops/distributor/${distributorId}`;
    if (type) {
      url += `?type=${type}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  addShop: async (shopData) => {
    const response = await api.post('/shops', shopData);
    return response.data;
  },
  updateShop: async (id, shopData) => {
    const response = await api.put(`/shops/${id}`, shopData);
    return response.data;
  },
  deleteShop: async (id) => {
    const response = await api.delete(`/shops/${id}`);
    return response.data;
  },
  getPendingShops: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.distributorId) queryParams.append('distributorId', params.distributorId);
    
    const url = `/shops/admin/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  updateShopApproval: async (id, approvalData) => {
    const response = await api.patch(`/shops/${id}/approval`, approvalData);
    return response.data;
  },
  getShopApprovalStatus: async (id) => {
    const response = await api.get(`/shops/${id}/approval-status`);
    return response.data;
  }
};

export default api;