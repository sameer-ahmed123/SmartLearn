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
    <div className={styles.container}>
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
