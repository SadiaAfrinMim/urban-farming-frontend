'use client';

import { useEffect, useState } from 'react';
import { Card, Button, LoadingSpinner, Alert } from '../../components/ui';
import ProfileImage from '../../components/ProfileImage';
import api from '../../lib/api';
import Link from 'next/link';

interface Comment {
  id: number;
  text: string;
  author: string;
  createdAt: string;
}

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status?: string;
    profileImage?: string;
  };
  stats: {
    postsCount: number;
    ordersCount: number;
  };
  recentPosts: Array<{
    id: number;
    title: string;
    category: string;
    isApproved: boolean;
    createdAt: string;
  }>;
}

export default function CustomerDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCustomerDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      // TODO: Implement API call for posting community comment
      const newComment: Comment = {
        id: Date.now(),
        text: comment,
        author: dashboardData?.user.name || 'Anonymous',
        createdAt: new Date().toISOString(),
      };
      setComments(prev => [newComment, ...prev]);
      setComment('');
      // Optionally refresh dashboard or show success message
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Alert type="error" className="max-w-md">
          {error}
          <div className="mt-4">
            <Button onClick={fetchDashboardData} size="sm">
              Try Again
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">Unable to load dashboard information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {dashboardData.user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {dashboardData.stats.postsCount}
            </div>
            <div className="text-gray-600">Total Posts</div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {dashboardData.stats.ordersCount}
            </div>
            <div className="text-gray-600">Total Orders</div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {dashboardData.recentPosts.filter(p => !p.isApproved).length}
            </div>
            <div className="text-gray-600">Pending Posts</div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {dashboardData.recentPosts.filter(p => p.isApproved).length}
            </div>
            <div className="text-gray-600">Approved Posts</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                 <ProfileImage user={dashboardData.user} size="lg" />
                 <div>
                  <h3 className="text-lg font-medium text-gray-900">{dashboardData.user.name}</h3>
                  <p className="text-gray-600">{dashboardData.user.email}</p>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      dashboardData.user.status === 'Active' ? 'bg-green-100 text-green-800' :
                      dashboardData.user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dashboardData.user.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link href="/customer/posts">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Manage My Posts
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Recent Posts */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Posts</h2>

            {dashboardData.recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-4">Create your first post to get started</p>
                <Link href="/customer/posts">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Create Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{post.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.category === 'Question' ? 'bg-blue-100 text-blue-800' :
                        post.category === 'Discussion' ? 'bg-green-100 text-green-800' :
                        post.category === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {post.category}
                      </span>
                      <span>{(() => {
                        try {
                          const date = new Date(post.createdAt);
                          return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                        } catch (error) {
                          return 'Invalid Date';
                        }
                      })()}</span>
                    </div>
                  </div>
                ))}

                {dashboardData.recentPosts.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/customer/posts">
                      <Button variant="outline" size="sm">
                        View All Posts
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Community Comments */}
      <Card className="mt-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community</h2>
          <form onSubmit={handleCommentSubmit}>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Share your thoughts
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your comment here..."
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Post Comment
            </Button>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Comments</h3>
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{comment.author}</span>
                      <span className="text-sm text-gray-500">{(() => {
                        try {
                          const date = new Date(comment.createdAt);
                          return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                        } catch (error) {
                          return 'Invalid Date';
                        }
                      })()}</span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/customer/posts">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                📝 Create New Post
              </Button>
            </Link>

            <Link href="/marketplace">
              <Button variant="outline" className="w-full">
                🛒 Browse Marketplace
              </Button>
            </Link>

            <Link href="/community">
              <Button variant="outline" className="w-full">
                👥 View Community
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}