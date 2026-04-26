'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'order' | 'rental' | 'info';
  read: boolean;
  createdAt: string;
}

export default function CommunityAndNotifications() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.get('/vendor/posts');
      // Mock data
    
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications
      setNotifications([
        {
          id: '1',
          message: 'New order received from Alice Johnson',
          type: 'order',
          read: false,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          message: 'Plot A1 has been rented by John Doe',
          type: 'rental',
          read: true,
          createdAt: '2024-01-14T16:30:00Z',
        },
        {
          id: '3',
          message: 'Monthly earnings report is ready',
          type: 'info',
          read: false,
          createdAt: '2024-01-13T08:00:00Z',
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle new post creation
    console.log('Creating new post:', newPost);
    setShowNewPostForm(false);
    setNewPost({ title: '', content: '' });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Community & Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 rounded border-l-4 ${
                  notif.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={notif.read ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Posts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Community Posts</h2>
            <button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              {showNewPostForm ? 'Cancel' : 'New Post'}
            </button>
          </div>

          {showNewPostForm && (
            <form onSubmit={handleNewPost} className="mb-6 p-4 border rounded">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <textarea
                  placeholder="Share your thoughts..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Post
              </button>
            </form>
          )}

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border-b pb-4">
                <h3 className="font-medium text-lg">{post.title}</h3>
                <p className="text-gray-600 mt-2">{post.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Posted on {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}