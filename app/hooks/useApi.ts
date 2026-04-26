// Data fetching hooks using React Query for better state management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Query Keys
export const queryKeys = {
  produces: ['produces'] as const,
  produce: (id: string) => ['produce', id] as const,
  rentalSpaces: ['rental-spaces'] as const,
  rentalSpace: (id: string) => ['rental-space', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  users: ['users'] as const,
  profile: ['profile'] as const,
  vendorProfile: ['vendor-profile'] as const,
  vendorProduces: ['vendor-produces'] as const,
  vendorRentalSpaces: ['vendor-rental-spaces'] as const,
  vendorOrders: ['vendor-orders'] as const,
};

// Produce Hooks
export const useProduces = () => {
  return useQuery({
    queryKey: queryKeys.produces,
    queryFn: () => api.getProduces(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduce = (id: string) => {
  return useQuery({
    queryKey: queryKeys.produce(id),
    queryFn: () => api.getProduce(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchProduces = (query: string) => {
  return useQuery({
    queryKey: ['produces', 'search', query],
    queryFn: () => api.searchProduces(query),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Rental Space Hooks
export const useRentalSpaces = () => {
  return useQuery({
    queryKey: queryKeys.rentalSpaces,
    queryFn: () => api.getRentalSpaces(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRentalSpace = (id: string) => {
  return useQuery({
    queryKey: queryKeys.rentalSpace(id),
    queryFn: () => api.getRentalSpace(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchRentalSpaces = (query: string) => {
  return useQuery({
    queryKey: ['rental-spaces', 'search', query],
    queryFn: () => api.searchRentalSpaces(query),
    enabled: !!query,
    staleTime: 2 * 60 * 1000,
  });
};

// Order Hooks
export const useOrders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => api.getOrders(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => api.getOrder(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// User Management Hooks (Admin only)
export const useUsers = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => api.getUsers(),
    enabled: !!isAdmin,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.getMyProfile(),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Vendor Hooks
export const useVendorProfile = () => {
  const { hasRole } = useAuth();
  return useQuery({
    queryKey: queryKeys.vendorProfile,
    queryFn: () => api.getVendorProfile(),
    enabled: hasRole('Vendor'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendorProduces = () => {
  const { hasRole } = useAuth();
  return useQuery({
    queryKey: queryKeys.vendorProduces,
    queryFn: () => api.getVendorProduces(),
    enabled: hasRole('Vendor'),
    staleTime: 2 * 60 * 1000,
  });
};

export const useVendorRentalSpaces = () => {
  const { hasRole } = useAuth();
  return useQuery({
    queryKey: queryKeys.vendorRentalSpaces,
    queryFn: () => api.getVendorRentalSpaces(),
    enabled: hasRole('Vendor'),
    staleTime: 2 * 60 * 1000,
  });
};

export const useVendorOrders = () => {
  const { hasRole } = useAuth();
  return useQuery({
    queryKey: queryKeys.vendorOrders,
    queryFn: () => api.getVendorOrders(),
    enabled: hasRole('Vendor'),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Mutation Hooks
export const useCreateProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createProduce>[0]) => api.createProduce(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProduces });
      queryClient.invalidateQueries({ queryKey: queryKeys.produces });
      toast.success('Produce created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create produce');
    },
  });
};

export const useUpdateProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateProduce>[1] }) =>
      api.updateProduce(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProduces });
      queryClient.invalidateQueries({ queryKey: queryKeys.produces });
      toast.success('Produce updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update produce');
    },
  });
};

export const useDeleteProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduce(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProduces });
      queryClient.invalidateQueries({ queryKey: queryKeys.produces });
      toast.success('Produce deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete produce');
    },
  });
};

export const useCreateRentalSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createRentalSpace>[0]) => api.createRentalSpace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorRentalSpaces });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentalSpaces });
      toast.success('Rental space created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create rental space');
    },
  });
};

export const useUpdateRentalSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateRentalSpace>[1] }) =>
      api.updateRentalSpace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorRentalSpaces });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentalSpaces });
      toast.success('Rental space updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update rental space');
    },
  });
};

export const useDeleteRentalSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRentalSpace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorRentalSpaces });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentalSpaces });
      toast.success('Rental space deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete rental space');
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createOrder>[0]) => api.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      toast.success('Order created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create order');
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      api.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User status updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });
};

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.updateVendorProfile>[0]) => api.updateVendorProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorProfile });
      toast.success('Profile updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

// Admin Hooks
export const useAllUsers = (filters?: any) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => api.getAllUsers(filters),
    enabled: !!isAdmin,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User role updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });
};

export const usePendingCertifications = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-certifications-pending'],
    queryFn: () => api.getPendingCertifications(),
    enabled: !!isAdmin,
    staleTime: 2 * 60 * 1000,
  });
};

export const useApproveCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) => api.approveCertification(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certifications-pending'] });
      toast.success('Certification approved successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to approve certification');
    },
  });
};

export const useRejectCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason?: string }) =>
      api.rejectCertification(vendorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certifications-pending'] });
      toast.success('Certification rejected!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to reject certification');
    },
  });
};

export const usePendingProduces = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-produces-pending'],
    queryFn: () => api.getPendingProduces(),
    enabled: !!isAdmin,
    staleTime: 2 * 60 * 1000,
  });
};

export const useApproveProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (produceId: string) => api.approveProduce(produceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-produces-pending'] });
      toast.success('Produce approved successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to approve produce');
    },
  });
};

export const useRejectProduce = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (produceId: string) => api.rejectProduce(produceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-produces-pending'] });
      toast.success('Produce rejected!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to reject produce');
    },
  });
};

export const useAllPosts = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => api.getAllPosts(),
    enabled: !!isAdmin,
    staleTime: 2 * 60 * 1000,
  });
};

export const useApprovePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.approvePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Post approved successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to approve post');
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Post deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });
};

export const useReports = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.getReports(),
    enabled: !!isAdmin,
    staleTime: 2 * 60 * 1000,
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => api.resolveReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Report resolved successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to resolve report');
    },
  });
};

export const useAllOrders = (filters?: any) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: () => api.getAllOrders(filters),
    enabled: !!isAdmin,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRentalAnalytics = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-analytics-rental'],
    queryFn: () => api.getRentalAnalytics(),
    enabled: !!isAdmin,
    staleTime: 10 * 60 * 1000,
  });
};

export const useRevenueAnalytics = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-analytics-revenue'],
    queryFn: () => api.getRevenueAnalytics(),
    enabled: !!isAdmin,
    staleTime: 10 * 60 * 1000,
  });
};

export const useRateLimitLogs = (filters?: any) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-logs-rate-limit', filters],
    queryFn: () => api.getRateLimitLogs(filters),
    enabled: !!isAdmin,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnnouncements = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  return useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => api.getAnnouncements(),
    enabled: !!isAdmin,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; target: string }) =>
      api.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create announcement');
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete announcement');
    },
  });
};

// Customer API Hooks
export const useCustomerPosts = () => {
  return useQuery({
    queryKey: ['customer-posts'],
    queryFn: () => api.getCustomerPosts(),
  });
};

export const useCreateCustomerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createCustomerPost>[0]) => api.createCustomerPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-posts'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dashboard'] });
      toast.success('Post created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
};

export const useUpdateCustomerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.updateCustomerPost>[1] }) =>
      api.updateCustomerPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-posts'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dashboard'] });
      toast.success('Post updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update post');
    },
  });
};

export const useDeleteCustomerPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCustomerPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-posts'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dashboard'] });
      toast.success('Post deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });
};

export const useCustomerDashboard = () => {
  return useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: () => api.getCustomerDashboard(),
  });
};

export const useCustomerOrders = () => {
  return useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => api.getCustomerOrders(),
  });
};

export const useToggleCustomerPostLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.toggleCustomerPostLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-posts'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to toggle like');
    },
  });
};

export const useAddCustomerPostComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.addCustomerPostComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-posts'] });
      toast.success('Comment added successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
};

export const useDeleteCustomerPostComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.deleteCustomerPostComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-posts'] });
      toast.success('Comment deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
};

// Community API Hooks
export const useCommunityPosts = () => {
  return useQuery({
    queryKey: ['community-posts'],
    queryFn: () => api.getCommunityPosts(),
  });
};

export const useCreateCommunityPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.createCommunityPost>[0]) => api.createCommunityPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api.toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to toggle like');
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      api.addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Comment added successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success('Comment deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
};