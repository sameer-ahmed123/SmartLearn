import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import styles from '../../Layout/TopBar.module.css';
import { Clock, Check } from 'lucide-react';

const NotificationDropdown = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className={styles.notifBox}>
      <div className={styles.notifHeader}>
        <span>Notifications</span>
        <button onClick={markAllAsRead} className={styles.markAll}>
          Mark all as read
        </button>
      </div>
      
      <div className="max-h-[350px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notif: any) => (
            <div 
              key={notif.id} 
              className={`${styles.notifItem} ${!notif.is_read ? styles.unreadItem : ''}`}
            >
              <p className={styles.notifTitle}>{notif.verb}</p>
              <div className={styles.notifTime}>
                <Clock size={10} />
                <span>{notif.created_at || 'Just now'}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <button className={styles.viewAllBtn}>View All Notifications</button>
    </div>
  );
};

export default NotificationDropdown;