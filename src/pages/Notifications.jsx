import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api, { API_URL } from '../api/axios';
function Notifications() {
  const user = JSON.parse(localStorage.getItem('user'));

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/my');
      setNotifications(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Notifications fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/read/${id}`);
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  useEffect(() => {
    fetchNotifications();

const socket = io(API_URL);

    if (user?.user_id) {
      socket.emit('join-user-room', user.user_id);
    }

    socket.on('new-notification', () => {
      toast.info('New notification received');
      fetchNotifications();
    });

    return () => socket.disconnect();
  }, []);

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'read') return item.is_read;
    if (filter === 'unread') return !item.is_read;
    return true;
  });

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <>
      <Navbar />

      <section className="notifications-page">
        <div className="section-title">
          <h2>Notifications 🔔</h2>
          <p>Your latest order, payment and delivery updates.</p>
        </div>

        <div className="notification-topbar">
          <div>
            <h3>{unreadCount} Unread Notifications</h3>
            <p>Total Notifications: {notifications.length}</p>
          </div>

          <button onClick={markAllRead}>
            Mark All Read
          </button>
        </div>

        <div className="orders-filter-box">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {loading && <h3>Loading notifications...</h3>}

        {!loading && filteredNotifications.length === 0 && (
          <div className="empty-box">
            <h2>No notifications found</h2>
            <p>Your notifications will appear here.</p>
          </div>
        )}

        <div className="notification-list">
          {filteredNotifications.map((item) => (
            <motion.div
              className={item.is_read ? 'notification-card read' : 'notification-card unread'}
              key={item.notification_id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="notification-icon">
                {item.type === 'order' && '📦'}
                {item.type === 'payment' && '💳'}
                {item.type === 'delivery' && '🚴'}
                {item.type === 'restaurant' && '🏨'}
                {item.type === 'general' && '🔔'}
              </div>

              <div className="notification-content">
                <h3>{item.title}</h3>
                <p>{item.message}</p>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
              </div>

              <div className="notification-action">
                <span className={item.is_read ? 'read-pill' : 'unread-pill'}>
                  {item.is_read ? 'Read' : 'New'}
                </span>

                {!item.is_read && (
                  <button onClick={() => markRead(item.notification_id)}>
                    Mark Read
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Notifications;