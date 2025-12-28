import React from "react";
import SideBar from "./SideBar";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "teacher" | "student" | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole,
}) => {
  return (
    <div className={styles.dashboardContainer}>
      <SideBar userRole={userRole} />
      <main className={styles.mainContent}>
        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
