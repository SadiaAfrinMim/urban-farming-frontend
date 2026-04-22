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
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ postContent: newPost })
      });
      
      if (!res.ok) throw new Error('পোস্ট করা যাচ্ছে না');
      
      setNewPost('');
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">← হোম পেজে ফিরে যান</Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">কমিউনিটি ফোরাম</h1>
        
        <form onSubmit={createPost} className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">নতুন পোস্ট করুন</h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="আপনার মতামত লিখুন..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={posting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {posting ? 'পোস্ট হচ্ছে...' : 'পোস্ট করুন'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 text-lg">কোনো পোস্ট পাওয়া যায়নি</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-semibold text-gray-800">{post.user?.name || 'ব্যবহারকারী'}</span>
                    <p className="text-gray-500 text-sm">{new Date(post.postDate).toLocaleString('bn-BD')}</p>
                  </div>
                </div>
                <p className="text-gray-700">{post.postContent}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
