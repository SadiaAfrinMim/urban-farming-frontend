'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../lib/api';

interface Notification {
  id: number;
  title?: string;
  message?: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'নোটিফিকেশন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.getUnreadNotificationCount();
      setUnreadCount(response.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'order': return '📦';
      case 'payment': return '💳';
      case 'rental': return '🏡';
      case 'system': return '⚙️';
      case 'promotion': return '🎉';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          <div className="text-xl text-gray-300 font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
            ← হোম পেজে ফিরে যান
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🔔 নোটিফিকেশনস
          </h1>
          <p className="text-lg text-gray-300">আপনার সকল নোটিফিকেশন এখানে</p>
          {unreadCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-900 text-green-200 rounded-full text-sm font-medium">
              <span>🔴</span>
              <span>{unreadCount} টি নতুন নোটিফিকেশন</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-300 px-6 py-4 rounded-xl mb-8 shadow-sm">
            ❌ {error}
          </div>
        )}

        {unreadCount > 0 && (
          <div className="mb-6 text-center">
            <button
              onClick={markAllAsRead}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              সবগুলো পড়া হিসেবে মার্ক করুন
            </button>
          </div>
        )}

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-gray-400 text-xl font-medium">কোনো নোটিফিকেশন নেই</div>
              <div className="text-gray-500 text-sm mt-2">নতুন নোটিফিকেশন আসলে এখানে দেখাবে</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-700 ${
                  !notification.isRead ? 'border-l-4 border-l-green-500 bg-gray-750' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-100">
                        {notification.title || 'নোটিফিকেশন'}
                      </h3>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-full transition-colors"
                        >
                          পড়া হয়েছে
                        </button>
                      )}
                    </div>
                    <p className="text-gray-300 text-base leading-relaxed mb-3">
                      {notification.message || 'নতুন নোটিফিকেশন'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatDate(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <span className="flex items-center gap-1 text-green-400">
                          <span>●</span>
                          <span>নতুন</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
