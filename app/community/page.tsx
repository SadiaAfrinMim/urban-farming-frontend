'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { CommunityPost } from '../lib/api';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getCommunityPosts();
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পোস্ট লিস্ট পেতে সমস্যা হয়েছে');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setPosting(true);
      setError(null);
      await api.createCommunityPost({
        postContent: newPost
      });

      setNewPost('');
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পোস্ট করা যাচ্ছে না');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <div className="text-xl text-gray-700 font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            👥 কমিউনিটি ফোরাম
          </h1>
          <p className="text-lg text-gray-600">উদ্যানবিদদের সাথে যুক্ত হোন এবং জ্ঞান ভাগ করুন</p>
        </div>

        <form onSubmit={createPost} className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-gray-100">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
            ✍️ নতুন পোস্ট করুন
          </h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="আপনার উদ্যানের অভিজ্ঞতা, টিপস বা প্রশ্ন লিখুন..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none shadow-sm"
            rows={4}
          />
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={posting}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              {posting ? '📤 পোস্ট হচ্ছে...' : '📝 পোস্ট করুন'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-sm">
            ❌ {error}
          </div>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-gray-500 text-xl font-medium">কোনো পোস্ট পাওয়া যায়নি</div>
              <div className="text-gray-400 text-sm mt-2">প্রথম পোস্ট করুন!</div>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                      {post.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-lg">{post.user?.name || 'ব্যবহারকারী'}</span>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        🕒 {new Date(post.postDate || post.createdAt).toLocaleString('bn-BD')}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{post.postContent}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
