import { useState, useEffect } from 'react';
import { TrashIcon, CheckIcon, BellIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  useEffect(() => { fetchNotifications(); }, [filter, pagination.currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: pagination.currentPage, limit: 20 });
      if (filter !== 'all') params.append('status', filter);
      const response = await axios.get(`${API_URL}/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, status: 'read' } : n));
      toast.success('Marked as read');
    } catch { toast.error('Failed to mark as read'); }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${notificationId}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch { toast.error('Failed to delete notification'); }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const getIcon = (iconName) => {
    const iconMap = { 'shopping-bag': '🛍️', 'check-circle': '✅', 'cog': '⚙️', 'truck': '🚚', 'gift': '🎁', 'x-circle': '❌', 'credit-card': '💳', 'alert-triangle': '⚠️', 'heart': '❤️', 'money': '💰', 'bell': '🔔' };
    return iconMap[iconName] || '🔔';
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-rose-500';
      case 'medium': return 'border-l-amber-400';
      case 'low': return 'border-l-green-400';
      default: return 'border-l-gray-300';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600';
      case 'medium': return 'bg-amber-50 text-amber-600';
      case 'low': return 'bg-green-50 text-green-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">{notifications.filter(n => n.status === 'unread').length} unread</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 text-sm focus:border-primary-600 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <button onClick={markAllAsRead}
              className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
              Mark All Read
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BellIcon className="h-8 w-8 text-violet-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification._id}
                className={`bg-white rounded-2xl border-l-4 ${getPriorityStyles(notification.priority)} border border-gray-100 p-5 transition-all hover:shadow-sm ${notification.status === 'unread' ? 'bg-white' : 'opacity-80'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0 mt-0.5">{getIcon(notification.icon)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold text-sm ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-500'}`}>
                            {notification.title}
                          </h3>
                          {notification.status === 'unread' && (
                            <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0" />
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-gray-400 text-xs">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {notification.data?.url && (
                            <a href={notification.data.url} className="text-violet-600 hover:text-violet-700 text-xs font-medium transition-colors">
                              View Details →
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {notification.status === 'unread' && (
                          <button onClick={() => markAsRead(notification._id)}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Mark as read">
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(notification._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium">
              Previous
            </button>
            <span className="px-4 py-2 text-gray-500 text-sm">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;