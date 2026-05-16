import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { apiCall } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    let pollInterval;
    
    const startPolling = () => {
      if (!pollInterval) {
        pollInterval = setInterval(fetchNotifications, 60000);
      }
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiCall('/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiCall(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
      case 'payment': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'promotion': return <InformationCircleIcon className="h-5 w-5 text-amber-500" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-stone-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-stone-100 z-[70] overflow-hidden transform origin-top-right transition-all">
            <div className="p-6 border-b border-stone-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Notifications</h3>
              <button onClick={() => setIsOpen(false)}><XMarkIcon className="h-5 w-5 text-stone-400" /></button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <BellIcon className="h-8 w-8 text-stone-200" />
                  </div>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">No new updates</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-4 hover:bg-stone-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-50/30' : ''}`}
                      onClick={() => markAsRead(n._id)}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-tight">{n.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest mt-2 block">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {!n.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
              <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">View All Notifications</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
