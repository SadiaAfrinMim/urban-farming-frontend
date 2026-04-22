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
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  quantity: number;
  vendorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface RentalSpace {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  size: string;
  image?: string;
  available: boolean;
}

export interface CommunityPost {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
}

export interface SustainabilityTip {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Produce[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
}

// API Service
const api = {
  // Produce / Marketplace
  getProduces: async (): Promise<Produce[]> => {
    const res = await fetch('/api/produces');
    const data: ApiResponse<Produce[]> = await res.json();
    return data.data;
  },

  getProduce: async (id: number): Promise<Produce> => {
    const res = await fetch(`/api/produces/${id}`);
    const data: ApiResponse<Produce> = await res.json();
    return data.data;
  },

  // Rental Spaces
  getRentalSpaces: async (): Promise<RentalSpace[]> => {
    const res = await fetch('/api/spaces');
    const data: ApiResponse<RentalSpace[]> = await res.json();
    return data.data;
  },

  // Community
  getCommunityPosts: async (): Promise<CommunityPost[]> => {
    const res = await fetch('/api/community/posts');
    const data: ApiResponse<CommunityPost[]> = await res.json();
    return data.data;
  },

  // Sustainability
  getSustainabilityTips: async (): Promise<SustainabilityTip[]> => {
    const res = await fetch('/api/sustainability/tips');
    const data: ApiResponse<SustainabilityTip[]> = await res.json();
    return data.data;
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const res = await fetch('/api/orders');
    const data: ApiResponse<Order[]> = await res.json();
    return data.data;
  },

  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (userData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const res = await fetch('/api/user');
    const data: ApiResponse<User[]> = await res.json();
    return data.data;
  },
};

export default api;
