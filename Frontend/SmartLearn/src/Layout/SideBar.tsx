import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import LogoutButton from "@/components/Auth/LogoutButton";

interface SidebarProps {
  userRole: "teacher" | "student" | null;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ userRole, isCollapsed, toggleSidebar }: SidebarProps) => {
  const location = useLocation();

  const teacherLinks = [
    { name: "Dashboard", path: "/teacher/dashboard", icon: "📊" },
    // dummy
    { name: "Assignments", path: "/assignments", icon: "📝" },
    { name: "Gradebook", path: "/grades", icon: "🎓" },
    { name: "Analytics", path: "/analytics", icon: "📈" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const studentLinks = [
    { name: "dashboard", path: "/student/dashboard", icon: "🎓" },
    // dummy links
    { name: "Assignments", path: "/assignments", icon: "📝" },
    { name: "Gradebook", path: "/grades", icon: "🎓" },
    { name: "Analytics", path: "/analytics", icon: "📈" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
  ];

  const links = userRole === "teacher" ? teacherLinks : studentLinks;

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.header}>
        {!isCollapsed && <h2 className={styles.logo}>SmartLearn</h2>}
        <button onClick={toggleSidebar} className={styles.toggleBtn}>
          {isCollapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      <nav className={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`${styles.link} ${
              location.pathname === link.path ? styles.active : ""
            }`}
            title={isCollapsed ? link.name : ""}
          >
            <span className={styles.icon}>{link.icon}</span>
            {!isCollapsed && <span className={styles.text}>{link.name}</span>}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn}>
          <span className={styles.icon}>🚪</span>
          {!isCollapsed && <LogoutButton />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
