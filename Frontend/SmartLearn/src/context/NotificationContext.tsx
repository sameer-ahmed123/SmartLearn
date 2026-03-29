import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({
  children,
  userToken,
}: {
  children: React.ReactNode;
  userToken: string | null;
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Fetch History from Backend on Load
  useEffect(() => {
    if (!userToken) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/notifications/",
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          // Calculate unread count from fetched history
          const unread = data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to fetch notification history:", error);
      }
    };

    fetchNotifications();
  }, [userToken]);

  // 2. Real-time WebSocket Logic
  useEffect(() => {
    if (!userToken) return;

    const socket = new WebSocket(
      `ws://localhost:8000/ws/notifications/?token=${userToken}`,
    );

    socket.onopen = () => console.log("✅ Notification WebSocket Connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("🔔 New Real-time Notification:", data);

      // Trigger Toast Pop-up
      toast.info(data.verb, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      // Update State: Add new notification to the top of the list
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.onerror = (err) => console.error("WebSocket Error:", err);

    socket.onclose = () =>
      console.log("❌ Notification WebSocket Disconnected");

    return () => {
      socket.close();
    };
  }, [userToken]);

  // 3. Mark All as Read Logic
  const markAllAsRead = async () => {
    if (!userToken || unreadCount === 0) return;

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/notifications/",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setUnreadCount(0);
        // Update local list to show everything as read
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
