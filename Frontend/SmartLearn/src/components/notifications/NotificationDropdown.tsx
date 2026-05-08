import { useNotifications } from "@/context/NotificationContext";
import styles from "../../Layout/TopBar.module.css";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useState } from "react";
const NotificationDropdown = () => {
  const {
    notifications,
    markAllAsRead,
    markSingleAsRead,
    loadMore,
    hasmore,
    loading,
  } = useNotifications();
  const [filter, setFilter] = useState<"unread" | "all">("all");
  const navigate = useNavigate();
  const role = useAuthStore((e) => e.role);

  const filteredNotifications = notifications.filter((n: any) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const handelNotificationClick = async (notif: any) => {
    console.log("Notification Clicked:", notif);
    // 1. Logic to determine the notification path
    let url = "";
    if (role === "student") {
      if (notif.target_type === "lecture") {
        url = `/student/lecture/${notif.target_id}/review/`;
      } else if (notif.target_type === "quiz") {
        url = `/student/lecture/${notif.target_id}/quiz/`;
      } else if (notif.target_type === "assignment") {
        url = `/student/lecture/${notif.target_id}/assignment/`;
      } else {
        url = "/dashboard";
      }
    } else if (role === "teacher") {
      if (notif.target_type === "lecture") {
        url = `/teacher/lecture/${notif.target_id}/review/`;
      } else if (notif.target_type === "quiz") {
        // this takes lecture id and maps to a quiz (QuizDetailView.tsx)
        url = `/teacher/lecture/${notif.lecture_id}/quiz/`;
      } else if (notif.target_type === "assignment") {
        url = `/teacher/lecture/${notif.target_id}/assignment/`;
      } else {
        url = "/dashboard";
      }
    }

    console.log("Target URL:", url);

    if (url) {
      // 2. Mark as read on the backend
      try {
        await markSingleAsRead(notif);
      } catch (e) {
        console.error("error marking as read", e);
      }
      // console.log("Attempting to navigate to:", url);
      // 3. Navigate
      navigate(url);
    } else {
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

      {/* filter tab  */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.tabBtn} ${filter === "all" ? styles.activeTab : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`${styles.tabBtn} ${filter === "unread" ? styles.activeTab : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      <div className="max-h-87.5 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">
            No notifications yet
          </div>
        ) : (
          <>
            {filteredNotifications.map((notif: any) => {
              let timeAgo = "recently";

              if (notif.created_at) {
                try {
                  timeAgo = formatDistanceToNow(parseISO(notif.created_at), {
                    addSuffix: true,
                  });
                } catch (err) {
                  console.error("Date parsing error:", err);
                  timeAgo = "just now"; // fallback if parsing fails
                }
              }
              return (
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
                    <span>{timeAgo || "Just now"}</span>
                  </div>
                </div>
              );
            })}

            {/* Load More Trigger */}
            {hasmore && (
              <div className="p-2 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent dropdown from closing
                    loadMore();
                  }}
                  disabled={loading}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {loading ? "Loading..." : "Load older notifications"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <button className={styles.viewAllBtn}>View All Notifications</button>
    </div>
  );
};

export default NotificationDropdown;
