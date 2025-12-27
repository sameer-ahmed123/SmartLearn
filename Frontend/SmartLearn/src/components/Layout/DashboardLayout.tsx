// DashboardLayout.jsx
import Sidebar from "./SideBar";
// Import the module styles
import styles from './DashboardLayout.module.css'; 

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        // Use styles.dashboardContainer for the main wrapper
        <div className={styles.dashboardContainer}>
            <Sidebar />
            
            {/* Use styles.mainContent for the scrollable content area */}
            <div className={styles.mainContent}> 
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;