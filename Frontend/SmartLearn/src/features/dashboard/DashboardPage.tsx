import StudentDashboard from "./student/StudentDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import { useAuthStore } from "../../store/useAuthStore";
import styles from "./DashboardPage.module.css";
import SideBar from "../../components/Layout/SideBar";

const DashboardPage = () => {
    const { role, user } = useAuthStore();

    return (
        <div className={styles.dashboardContainer}>
            <SideBar />
            <div className={styles.mainContent}>
                <div className={styles.welcomeSection}>
                    <h2>Welcome back, {user?.name || 'User'}!</h2>
                </div>
                {role === "student" && <StudentDashboard />}
                {role === "teacher" && <TeacherDashboard />}
                {!role && <div>Loading...</div>}
            </div>
        </div>
    );
};

export default DashboardPage;
