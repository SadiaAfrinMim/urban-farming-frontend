// Common API Response type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types
export interface Produce {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  availableQuantity: number;
  certificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalSpace {
  id: number;
  vendorId: number;
  location: string;
  size: string;
  price: number;
  availability: boolean;
  image?: string;
  plantStatus?: PlantHealth;
  lastWatered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: number;
  title?: string;
  content?: string;
  postContent?: string;
  authorId?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  postDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SustainabilityTip {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface Order {
  id: string;
  userId: string;
  totalAmount?: number;
  total?: number;
  status: string;
  createdAt: string;
  items?: any[];
  produce?: Produce;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  status?: 'Active' | 'Pending' | 'Suspended';
  createdAt?: string;
}

export interface VendorProfile {
  id: string;
  farmName: string;
  farmLocation: string;
  certificationStatus: 'Pending' | 'Approved' | 'Rejected';
  profilePhoto?: string;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  status: 'Active' | 'Pending' | 'Suspended';
  profileData?: {
    farmName?: string;
    farmLocation?: string;
    certificationStatus?: string;
  };
}

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,    
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Enhanced HTTP client with proper error handling
const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if token is available in localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Cookies are also sent automatically by the browser

    // Log API call details
    const startTime = Date.now();
    console.log(`🚀 API Call: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`, {
      headers: { ...headers },
      body: options.body,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options,
      });

      let data: any;
      let rawResponseText = '';
      try {
        rawResponseText = await response.text();
        data = rawResponseText ? JSON.parse(rawResponseText) : {};
      } catch (jsonError) {
        console.warn('Failed to parse JSON response:', jsonError, 'Raw response:', rawResponseText);
        data = { message: 'Unknown error occurred', rawResponse: rawResponseText };
      }

      // Log response details
      const duration = Date.now() - startTime;
      console.log(`✅ API Response: ${response.status} ${API_BASE_URL}${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        data: data,
        duration: `${duration}ms`
      });

      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: `${API_BASE_URL}${endpoint}`,
          hasResponseBody: !!rawResponseText,
          responseLength: rawResponseText.length,
          rawResponseText: rawResponseText.substring(0, 200), // First 200 chars for debugging
          parsedData: data,
          headers: Object.fromEntries(response.headers.entries())
        });

        // Provide more specific error messages
        let errorMessage = data.message || data.error;
        if (!errorMessage) {
          if (response.status === 401) {
            errorMessage = 'Authentication required. Please login again.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. Insufficient permissions.';
          } else if (response.status === 404) {
            errorMessage = 'Requested resource not found.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }

        throw new ApiError(
          errorMessage,
          response.status,
          { ...data, rawResponse: rawResponseText, url: `${API_BASE_URL}${endpoint}` }
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0,
        null
      );
    }
  },

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: HeadersInit = {};
    // Cookies are sent automatically with all requests

    // Add Authorization header if token is available in localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        data = { message: 'Upload failed' };
      }

      if (!response.ok) {
        throw new ApiError(
          data.message || `Upload failed: ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Upload failed',
        0,
        null
      );
    }
  },
};

// API Service
const api = {
  // Produce / Marketplace
  getProduces: async (): Promise<Produce[]> => {
    const data = await apiClient.get<ApiResponse<Produce[]>>('/produces');
    return Array.isArray(data.data) ? data.data : [];
  },

  searchProduces: async (query: string): Promise<Produce[]> => {
    const data = await apiClient.get<ApiResponse<Produce[]>>(`/produces/search?q=${encodeURIComponent(query)}`);
    return Array.isArray(data.data) ? data.data : [];
  },

  getProduce: async (id: string): Promise<Produce> => {
    const data = await apiClient.get<ApiResponse<Produce>>(`/produces/${id}`);
    return data.data;
  },

  // Rental Spaces (corrected endpoint)
  getRentalSpaces: async (): Promise<RentalSpace[]> => {
    const data = await apiClient.get<ApiResponse<RentalSpace[]>>('/rentals');
    return Array.isArray(data.data) ? data.data : [];
  },

  getRentalSpace: async (id: string): Promise<RentalSpace> => {
    const data = await apiClient.get<ApiResponse<RentalSpace>>(`/rentals/${id}`);
    return data.data;
  },

  searchRentalSpaces: async (query: string): Promise<RentalSpace[]> => {
    const data = await apiClient.get<ApiResponse<RentalSpace[]>>(`/rentals/search?q=${encodeURIComponent(query)}`);
    return Array.isArray(data.data) ? data.data : [];
  },

  // Community
  getCommunityPosts: async (): Promise<CommunityPost[]> => {
    const data = await apiClient.get<ApiResponse<CommunityPost[]>>('/community/posts');
    return Array.isArray(data.data) ? data.data : [];
  },

  getCommunityPost: async (id: number): Promise<CommunityPost> => {
    const data = await apiClient.get<ApiResponse<CommunityPost>>(`/community/posts/${id}`);
    return data.data;
  },

  createCommunityPost: async (postData: { postContent: string }) => {
    return apiClient.post('/community/posts', postData);
  },

  updateCommunityPost: async (id: number, postData: { postContent: string }) => {
    return apiClient.patch(`/community/posts/${id}`, postData);
  },

  deleteCommunityPost: async (id: number) => {
    return apiClient.delete(`/community/posts/${id}`);
  },

  // Sustainability (corrected endpoint - using certs instead of tips)
  getSustainabilityCerts: async (): Promise<SustainabilityTip[]> => {
    const data = await apiClient.get<ApiResponse<SustainabilityTip[]>>('/sustainability/certs');
    return Array.isArray(data.data) ? data.data : [];
  },

  createSustainabilityCert: async (certData: Omit<SustainabilityTip, 'id'>) => {
    return apiClient.post('/sustainability/certs', certData);
  },

  updateSustainabilityCert: async (id: string, certData: Partial<SustainabilityTip>) => {
    return apiClient.patch(`/sustainability/certs/${id}`, certData);
  },

  deleteSustainabilityCert: async (id: string) => {
    return apiClient.delete(`/sustainability/certs/${id}`);
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const data = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return Array.isArray(data.data) ? data.data : [];
  },

  createOrder: async (orderData: { produceId: number; quantity: number; totalPrice: number }) => {
    return apiClient.post('/orders', orderData);
  },

  getOrder: async (id: string): Promise<Order> => {
    const data = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },

  updateOrder: async (id: string, orderData: Partial<Order>) => {
    return apiClient.patch(`/orders/${id}`, orderData);
  },

  deleteOrder: async (id: string) => {
    return apiClient.delete(`/orders/${id}`);
  },

  // Payments
  createPaymentIntent: async (orderId: string) => {
    return apiClient.post('/payments/create-intent', { orderId });
  },

  confirmPayment: async (paymentIntentId: string) => {
    return apiClient.post('/payments/confirm', { paymentIntentId });
  },

  createCheckoutSession: async (orderId: string) => {
    return apiClient.post('/payments/checkout-session', { orderId });
  },

  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    // Store access token in localStorage as backup for Authorization header
    if (response.success && response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'Customer' | 'Vendor' | 'Admin';
    farmName?: string;
    farmLocation?: string;
    adminCode?: string;
  }) => {
    return apiClient.post('/auth/register', userData);
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    // Update localStorage token if refresh was successful
    if (response.success && response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response;
  },

  changePassword: async (passwordData: { oldPassword: string; newPassword: string }) => {
    return apiClient.post('/auth/change-password', passwordData);
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    // Clear localStorage token
    localStorage.removeItem('accessToken');
    return response;
  },

  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const data = await apiClient.get<ApiResponse<User[]>>('/admin/users');
    return Array.isArray(data.data) ? data.data : [];
  },

  getAllUsers: async (filters?: any): Promise<User[]> => {
    const queryString = filters ? new URLSearchParams(filters).toString() : '';
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    const data = await apiClient.get<ApiResponse<User[]>>(url);
    return Array.isArray(data.data) ? data.data : [];
  },

  updateUserStatus: async (userId: string, status: string) => {
    return apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  updateUserRole: async (userId: string, role: string) => {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  getMyProfile: async () => {
    return apiClient.get('/user/me');
  },

  updateProfile: async (profileData: any) => {
    // Check if profileData is FormData (for file uploads)
    if (profileData instanceof FormData) {
      return apiClient.upload('/user/update-my-profile', profileData);
    } else {
      // Send as regular JSON
      return apiClient.patch('/user/update-my-profile', profileData);
    }
  },

  changeProfileStatus: async (userId: string, statusData: { status: string }) => {
    return apiClient.patch(`/user/${userId}/status`, statusData);
  },

  createCustomer: async (userData: { name: string; email: string; password: string }) => {
    return apiClient.post('/user/create-customer', userData);
  },

  createVendor: async (userData: { name: string; email: string; password: string }) => {
    return apiClient.post('/user/create-vendor', userData);
  },

  createAdmin: async (userData: { name: string; email: string; password: string; adminCode: string }) => {
    return apiClient.post('/user/create-admin', userData);
  },

  // Vendor APIs
  getVendorProfile: async (): Promise<VendorProfile> => {
    const data = await apiClient.get<ApiResponse<VendorProfile>>('/vendor/profile');
    return data.data;
  },

  getVendorCard: async () => {
    return apiClient.get('/vendor/card');
  },

  updateVendorProfile: async (formData: FormData) => {
    return apiClient.upload('/vendor/profile', formData);
  },

  // Admin APIs
  // User Management
  getAllUsers: async (filters?: any) => {
    const queryString = filters ? new URLSearchParams(filters).toString() : '';
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    const data = await apiClient.get<ApiResponse<User[]>>(url);
    return data.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    return apiClient.patch(`/admin/users/${userId}/status`, { status });
  },

  updateUserRole: async (userId: string, role: string) => {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  // Certification Management
  getPendingCertifications: async () => {
    const data = await apiClient.get<ApiResponse<any[]>>('/admin/certifications/pending');
    return data.data;
  },

  approveCertification: async (vendorId: string) => {
    return apiClient.patch(`/admin/certifications/${vendorId}/approve`);
  },

  rejectCertification: async (vendorId: string, reason?: string) => {
    return apiClient.patch(`/admin/certifications/${vendorId}/reject`, { reason });
  },

  // Produce Management
  getPendingProduces: async () => {
    const data = await apiClient.get<ApiResponse<any[]>>('/admin/produces/pending');
    return data.data;
  },

  approveProduce: async (produceId: string) => {
    return apiClient.patch(`/admin/produces/${produceId}/approve`);
  },

  rejectProduce: async (produceId: string) => {
    return apiClient.patch(`/admin/produces/${produceId}/reject`);
  },

  // Post Moderation
  getAllPosts: async () => {
    const data = await apiClient.get<ApiResponse<any[]>>('/admin/posts');
    return data.data;
  },

  approvePost: async (postId: string) => {
    return apiClient.patch(`/admin/posts/${postId}/approve`);
  },

  deletePost: async (postId: string) => {
    return apiClient.delete(`/admin/posts/${postId}`);
  },

  // Report Management
  getReports: async () => {
    const data = await apiClient.get<ApiResponse<any[]>>('/admin/reports');
    return data.data;
  },

  resolveReport: async (reportId: string) => {
    return apiClient.patch(`/admin/reports/${reportId}/resolve`);
  },

  // Order Analytics
  getAllOrders: async (filters?: any) => {
    const queryString = filters ? new URLSearchParams(filters).toString() : '';
    const url = queryString ? `/admin/orders?${queryString}` : '/admin/orders';
    const data = await apiClient.get<ApiResponse<any[]>>(url);
    return data.data;
  },

  // Analytics
  getRentalAnalytics: async () => {
    const data = await apiClient.get<ApiResponse<any>>('/admin/analytics/rental');
    return data.data;
  },

  getRevenueAnalytics: async () => {
    const data = await apiClient.get<ApiResponse<any>>('/admin/analytics/revenue');
    return data.data;
  },

  // System Logs
  getRateLimitLogs: async (filters?: any) => {
    const queryString = filters ? new URLSearchParams(filters).toString() : '';
    const url = queryString ? `/admin/logs/rate-limit?${queryString}` : '/admin/logs/rate-limit';
    const data = await apiClient.get<ApiResponse<any[]>>(url);
    return data.data;
  },

  // Announcements
  createAnnouncement: async (announcementData: { title: string; content: string; target: string }) => {
    return apiClient.post('/admin/announcements', announcementData);
  },

  getAnnouncements: async () => {
    const data = await apiClient.get<ApiResponse<any[]>>('/admin/announcements');
    return data.data;
  },

  deleteAnnouncement: async (announcementId: string) => {
    return apiClient.delete(`/admin/announcements/${announcementId}`);
  },

  getVendorProduces: async (): Promise<Produce[]> => {
    const data = await apiClient.get<ApiResponse<Produce[]>>('/vendor/produces');
    return Array.isArray(data.data) ? data.data : [];
  },

  createProduce: async (produceData: Omit<Produce, 'id' | 'createdAt' | 'updatedAt' | 'image'> & { image?: File }) => {
    const formData = new FormData();

    // Add text fields
    Object.entries(produceData).forEach(([key, value]) => {
      if (key !== 'image' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Add image file if present
    if (produceData.image) {
      formData.append('image', produceData.image);
    }

    return apiClient.upload('/vendor/produces', formData);
  },

  updateProduce: async (id: string, produceData: Partial<Produce>) => {
    return apiClient.patch(`/vendor/produces/${id}`, produceData);
  },

  deleteProduce: async (id: string) => {
    return apiClient.delete(`/vendor/produces/${id}`);
  },

  getVendorRentalSpaces: async (): Promise<RentalSpace[]> => {
    const data = await apiClient.get<ApiResponse<RentalSpace[]>>('/vendor/rental-spaces');
    return Array.isArray(data.data) ? data.data : [];
  },

  createRentalSpace: async (spaceData: Omit<RentalSpace, 'id' | 'vendorId' | 'createdAt' | 'availability' | 'image'> & { image?: File }) => {
    const formData = new FormData();

    // Add text fields
    Object.entries(spaceData).forEach(([key, value]) => {
      if (key !== 'image' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Add image file if present
    if (spaceData.image) {
      formData.append('image', spaceData.image);
    }

    return apiClient.upload('/vendor/rental-spaces', formData);
  },

  updateRentalSpace: async (id: string, spaceData: Partial<RentalSpace>) => {
    return apiClient.patch(`/vendor/rental-spaces/${id}`, spaceData);
  },

  deleteRentalSpace: async (id: string) => {
    return apiClient.delete(`/vendor/rental-spaces/${id}`);
  },

  toggleRentalSpaceAvailability: async (id: string) => {
    return apiClient.patch(`/vendor/rental-spaces/${id}/availability`, {});
  },

  updatePlantStatus: async (updateData: { rentalSpaceId: string; plantStatus?: string; lastWatered?: string }) => {
    return apiClient.patch('/vendor/plant-update', updateData);
  },

  getVendorOrders: async (): Promise<Order[]> => {
    const data = await apiClient.get<ApiResponse<Order[]>>('/vendor/orders');
    return Array.isArray(data.data) ? data.data : [];
  },
};

export default api;
