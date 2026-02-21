import { useState } from "react";
import Sidebar from "./SideBar";
import styles from "./DashboardLayout.module.css";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  userRole: "teacher" | "student" | null;
}

const DashboardLayout = ({ userRole }: DashboardLayoutProps) => {
  // State to manage collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.container} style={{ position: "relative" }}>
      {/* Translation Widget Container: 
          Isay yahan isliye rakha hai taake ye har page par top-right corner mein nazar aaye.
      */}
      <div 
        id="google_translate_element" 
        style={{
          position: "fixed", 
          top: "15px", 
          right: "20px", 
          zIndex: 1001, // Sidebar se zayada taake upar rahay
          background: "white",
          padding: "4px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          minHeight: "38px"
        }}
      >
        {/* Google script yahan dropdown load karega */}
      </div>

      <Sidebar
        userRole={userRole}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Dynamic class for margin adjustment */}
      <main
        className={`${styles.mainContent} ${
          isCollapsed ? styles.mainCollapsed : ""
        }`}
      >
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;