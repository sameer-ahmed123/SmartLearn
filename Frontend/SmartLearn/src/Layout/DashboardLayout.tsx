import { useState } from "react";
import SideBar from "./SideBar"; // B capital jaisa aapki file hai
import TopBar from "./TopBar";
import styles from "./DashboardLayout.module.css";
import { Outlet } from "react-router-dom";

interface DashboardLayoutProps {
  userRole: "teacher" | "student" | null;
}

const DashboardLayout = ({ userRole }: DashboardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.container}>
      <SideBar
        userRole={userRole}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={`${styles.mainContent} ${isCollapsed ? styles.mainCollapsed : ""}`}>
        <TopBar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;