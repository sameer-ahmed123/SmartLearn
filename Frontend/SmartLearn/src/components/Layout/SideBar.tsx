import LogoutButton from '../Auth/LogoutButton';
import styles from './DashboardLayout.module.css'; 
// Assuming you have styles for navItem and navItemActive defined in your module file

const Sidebar = () => {
    
    return (
        <div className={styles.sidebar}> 
            <h1>SmartLearn.</h1>

            <div className={`${styles.navItem} active`}>🏠 Dashboard</div>
            
            <div className={styles.navItem}>📚 Courses</div>
            <div className={styles.navItem}>💬 Messages</div>
            <div className={styles.navItem}>⚙️ Settings</div>

            <div className={styles.navItem} style={{ marginTop: "auto", color: "black",marginBottom:"35px" }}>
                <LogoutButton/>
            </div>
        </div>
    );
};

export default Sidebar;