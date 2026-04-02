import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { toast } from "react-toastify";
import apiClient from "@/api/apiClient";
import { useAuthStore } from "@/store/useAuthStore";

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const userToken = useAuthStore((state) => state.accessToken);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);

  // 1. Fetch History from Backend on Load
  useEffect(() => {
    if (!userToken) return;

    const fetchNotifications = async () => {
      try {
        const response = await apiClient.get("/notifications/");
        setNotifications(response.data);
        // Calculate unread count from fetched history
        const unread = response.data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notification history:", error);
      }
    };

    fetchNotifications();
  }, [userToken]);

  // 2. Real-time WebSocket Logic
  useEffect(() => {
    if (!userToken) return;

    //close existing socket before opening new
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(
      `ws://localhost:8000/ws/notifications/?token=${userToken}`,
    );
    socketRef.current = socket; // set socket connection as current referenc in sockerRef

    socket.onopen = () => console.log("✅ Notification WebSocket Connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("🔔 New Real-time Notification:", data);

      // Trigger Toast Pop-up
      toast.info(data.verb, {
        // autoClose: 5000,
      });

      // Update State: Add new notification to the top of the list
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1); //update unread count
    };

    socket.onerror = (err) => console.error("WebSocket Error:", err);

    socket.onclose = () =>
      console.log("❌ Notification WebSocket Disconnected");

    return () => {
      // close socket on component unmount
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userToken]);

  // 3. Mark All as Read Logic
  const markAllAsRead = async () => {
    if (!userToken || unreadCount === 0) return;

    try {
      const response = await apiClient.patch("/notifications/");
      if (response.status === 200) {
        setUnreadCount(0);
        // Update local list to show everything as read
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  //  4. mark a single notification as read
  const markSingleAsRead = async (notif: any) => {
    if (!userToken || unreadCount === 0) return;

    try {
      const response = await apiClient.patch(`/notifications/mark-by-target/`, {
        target_type: notif.target_type,
        target_id: notif.target_id,
      });
      if (response.status === 200) {
        // 2. Update the local UI state
        // We find ANY notification with the matching target and mark it true
        let matchedCount = 0;

        setNotifications((prev) =>
          prev.map((n) => {
            if (
              n.target_type === notif.target_type && //matching target_type
              n.target_id === notif.target_id && //matching target_id
              !n.is_read //is not read
            ) {
              matchedCount++;
              return { ...n, is_read: true };
            }
            return n;
          }),
        );

        // 3. Decrement the bell counter by however many we just marked as read
        setUnreadCount((prev) => Math.max(0, prev - matchedCount));
      }
    } catch (e) {
      console.log("unable to mark notification as read", e);
    }
  };
  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, markSingleAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
