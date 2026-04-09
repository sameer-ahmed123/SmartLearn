import React from "react";
import { useNotifications } from "@/context/NotificationContext";
import styles from "../../Layout/TopBar.module.css";
import { Clock } from "lucide-react";
import apiClient from "@/api/apiClient";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
  const { notifications, markAllAsRead,markSingleAsRead } = useNotifications();
  const navigate = useNavigate();

  const handelNotificationClick = async (notif: any) => {
    console.log("Notification Clicked:", notif);
    // 1. Logic to determine the notification path
    let url = "";
    if (notif.target_type === "lecture") {
      url = `/student/lecture/${notif.target_id}/review/`;
    } else if (notif.target_type === "quiz") {
      url = `/student/lecture/${notif.target_id}/quiz/`;
    } else if (notif.target_type === "assignment") {
      url = `/student/lecture/${notif.target_id}/assignment/`;
    }
    else{
      url = "/dashboard"
    }
    console.log("Target URL:", url);

    if (url) {
      // 2. Mark as read on the backend 
      try {
        await markSingleAsRead(notif)
      } catch (e) {
        console.error("error marking as read", e);
      }
      // console.log("Attempting to navigate to:", url);
      // 3. Navigate
      navigate(url);
    }
    else{
      console.warn("No URL generated for target_type:", notif.target_type);
    }
  };

  return (
    <div className={styles.notifBox}>
      <div className={styles.notifHeader}>
        <span>Notifications</span>
        <button onClick={markAllAsRead} className={styles.markAll}>
          Mark all as read
        </button>
      </div>

      <div className="max-h-87.5 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">
            No notifications yet
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          notifications.map((notif: any) => (
            <div
              key={notif.id}
              onClick={() => {
                handelNotificationClick(notif);
              }}
              className={`${styles.notifItem} ${!notif.is_read ? styles.unreadItem : ""}`}
            >
              <p className={styles.notifTitle}>{notif.verb}</p>
              <div className={styles.notifTime}>
                <Clock size={10} />
                <span>{notif.created_at || "Just now"}</span>
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
