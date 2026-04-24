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
  id: string;
  name: string;
  description?: string;
  price: number;
  location: string;
  size: string;
  image?: string;
  available: boolean;
  rentedBy?: string;
  rentalStart?: string;
  rentalEnd?: string;
  plantStatus?: string;
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

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken'); // Assuming JWT token is stored in localStorage
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API call failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

// API Service
const api = {
  // Produce / Marketplace
  getProduces: async (): Promise<Produce[]> => {
    const data: ApiResponse<Produce[]> = await apiCall('/produces');
    return Array.isArray(data.data) ? data.data : [];
  },

  getProduce: async (id: number): Promise<Produce> => {
    const data: ApiResponse<Produce> = await apiCall(`/produces/${id}`);
    return data.data;
  },

  // Rental Spaces
  getRentalSpaces: async (): Promise<RentalSpace[]> => {
    const data: ApiResponse<RentalSpace[]> = await apiCall('/spaces');
    return Array.isArray(data.data) ? data.data : [];
  },

  getRentalSpace: async (id: number): Promise<RentalSpace> => {
    const data: ApiResponse<RentalSpace> = await apiCall(`/spaces/${id}`);
    return data.data;
  },

  // Community
  getCommunityPosts: async (): Promise<CommunityPost[]> => {
    const data: ApiResponse<CommunityPost[]> = await apiCall('/community/posts');
    return Array.isArray(data.data) ? data.data : [];
  },

  createCommunityPost: async (postData: { title: string; content: string }) => {
    return apiCall('/community/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Sustainability
  getSustainabilityTips: async (): Promise<SustainabilityTip[]> => {
    const data: ApiResponse<SustainabilityTip[]> = await apiCall('/sustainability/tips');
    return Array.isArray(data.data) ? data.data : [];
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const data: ApiResponse<Order[]> = await apiCall('/orders');
    return Array.isArray(data.data) ? data.data : [];
  },

  createOrder: async (orderData: { items: any[]; totalAmount: number }) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Auth
  login: async (email: string, password: string) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  refreshToken: async (refreshToken: string) => {
    return apiCall('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  changePassword: async (passwordData: { oldPassword: string; newPassword: string }) => {
    return apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const data: ApiResponse<User[]> = await apiCall('/user');
    return Array.isArray(data.data) ? data.data : [];
  },

  updateUserStatus: async (userId: string, status: string) => {
    return apiCall(`/user/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getMyProfile: async () => {
    return apiCall('/user/me');
  },

  updateProfile: async (profileData: any) => {
    return apiCall('/user/update-my-profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  // Vendor APIs
  getVendorDashboardStats: async () => {
    return apiCall('/vendor/dashboard-stats');
  },

  getVendorProfile: async (): Promise<VendorProfile> => {
    const data: ApiResponse<VendorProfile> = await apiCall('/vendor/profile');
    return data.data;
  },

  updateVendorProfile: async (profileData: Partial<VendorProfile>) => {
    const formData = new FormData();

    // Add text fields
    Object.entries(profileData).forEach(([key, value]) => {
      if (key !== 'certifications' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Add certification files if any
    if (profileData.certifications && Array.isArray(profileData.certifications)) {
      profileData.certifications.forEach((cert, index) => {
        if (cert instanceof File) {
          formData.append('certification', cert);
        }
      });
    }

    return fetch(`${API_BASE_URL}/vendor/profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  getVendorProduces: async (): Promise<Produce[]> => {
    const data: ApiResponse<Produce[]> = await apiCall('/vendor/produces');
    return Array.isArray(data.data) ? data.data : [];
  },

  createProduce: async (produceData: Omit<Produce, 'id' | 'createdAt' | 'updatedAt'>) => {
    return apiCall('/vendor/produces', {
      method: 'POST',
      body: JSON.stringify(produceData),
    });
  },

  updateProduce: async (id: string, produceData: Partial<Produce>) => {
    return apiCall(`/vendor/produces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(produceData),
    });
  },

  deleteProduce: async (id: string) => {
    return apiCall(`/vendor/produces/${id}`, {
      method: 'DELETE',
    });
  },

  getVendorRentalSpaces: async (): Promise<RentalSpace[]> => {
    const data: ApiResponse<RentalSpace[]> = await apiCall('/vendor/rental-spaces');
    return Array.isArray(data.data) ? data.data : [];
  },

  createRentalSpace: async (spaceData: Omit<RentalSpace, 'id' | 'createdAt' | 'updatedAt' | 'available'>) => {
    return apiCall('/vendor/rental-spaces', {
      method: 'POST',
      body: JSON.stringify(spaceData),
    });
  },

  updateRentalSpace: async (id: string, spaceData: Partial<RentalSpace>) => {
    return apiCall(`/vendor/rental-spaces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(spaceData),
    });
  },

  deleteRentalSpace: async (id: string) => {
    return apiCall(`/vendor/rental-spaces/${id}`, {
      method: 'DELETE',
    });
  },

  updatePlantStatus: async (updateData: { rentalSpaceId: string; plantStatus?: string; lastWatered?: string }) => {
    return apiCall('/vendor/plant-update', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  getVendorOrders: async (): Promise<Order[]> => {
    const data: ApiResponse<Order[]> = await apiCall('/vendor/orders');
    return Array.isArray(data.data) ? data.data : [];
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    return apiCall(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export default api;
