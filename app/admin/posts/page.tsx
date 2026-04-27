'use client';

import Link from 'next/link';
import { CheckCircle, XCircle, MessageSquare, User, AlertCircle, Calendar } from 'lucide-react';
import { useAllPosts, useApprovePost, useDeletePost } from '../../hooks/useApi';
import toast from 'react-hot-toast';

interface CommunityPost {
  id: number;
  title?: string;
  content?: string;
  postContent?: string;
  isApproved?: boolean;
  postDate?: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminPostsPage() {
  const { data: posts = [], isLoading: loading, error, refetch } = useAllPosts();
  const approvePostMutation = useApprovePost();
  const deletePostMutation = useDeletePost();

  const handleApprove = async (postId: number) => {
    try {
      await approvePostMutation.mutateAsync(postId.toString());
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('আপনি কি এই পোস্টটি মুছে ফেলতে চান?')) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(postId.toString());
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ত্রুটি</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'পোস্ট লোড করতে সমস্যা হয়েছে'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            রিফ্রেশ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">← এডমিন ড্যাশবোর্ডে ফিরে যান</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">কমিউনিটি পোস্ট মডারেশন</h1>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">কোনো পোস্ট নেই</h3>
            <p className="text-gray-500">কমিউনিটিতে এখনও কোনো পোস্ট করা হয়নি।</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{post.user?.name || 'Unknown User'}</h3>
                      <span className="text-sm text-gray-500">{post.user?.email}</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.isApproved ? 'অনুমোদিত' : 'পেন্ডিং'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{post.content || post.postContent}</p>
                    </div>

                    {/* Action Buttons */}
                    {!post.isApproved && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(post.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          অনুমোদন করুন
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          মুছে ফেলুন
                        </button>
                      </div>
                    )}

                    {post.isApproved && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          মুছে ফেলুন
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}